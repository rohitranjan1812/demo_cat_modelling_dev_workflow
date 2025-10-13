const { MongoClient } = require('mongodb');

async function initializeReplicaSet() {
    const uri = 'mongodb://127.0.0.1:27018';
    const client = new MongoClient(uri, {
        connectTimeoutMS: 60000,
        serverSelectionTimeoutMS: 60000,
        socketTimeoutMS: 60000,
        directConnection: true
    });
    
    try {
        console.log('🔍 Connecting to MongoDB on 127.0.0.1:27018...');
        console.log('   Using direct connection with extended timeout...');
        await client.connect();
        console.log('✅ Connected successfully');
        
        const admin = client.db('admin');
        
        // Check if replica set is already initialized
        try {
            console.log('🔍 Checking replica set status...');
            const status = await admin.command({ replSetGetStatus: 1 });
            console.log('✅ Replica set already initialized');
            const primary = status.members.find(m => m.stateStr === 'PRIMARY');
            if (primary) {
                console.log('✅ Primary node:', primary.name);
                console.log('🎉 MongoDB is ready for transactions!');
                return true;
            } else {
                console.log('⏳ No primary elected yet, waiting...');
            }
        } catch (error) {
            if (error.message.includes('no replset config')) {
                console.log('🔧 MongoDB running with --replSet but not initialized');
                console.log('🚀 Initializing replica set rs0...');
                
                // Initialize replica set
                const config = {
                    _id: 'rs0',
                    members: [{ _id: 0, host: '127.0.0.1:27018' }]
                };
                
                const result = await admin.command({ replSetInitiate: config });
                console.log('✅ Replica set initialization started');
                console.log('   Result:', result.ok === 1 ? 'OK' : result);
                
                // Wait for primary election
                console.log('');
                console.log('⏳ Waiting for primary election (this may take 30-60 seconds)...');
                
                for (let i = 0; i < 60; i++) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        const status = await admin.command({ replSetGetStatus: 1 });
                        const primary = status.members.find(m => m.stateStr === 'PRIMARY');
                        
                        if (primary) {
                            console.log('');
                            console.log('🎉 SUCCESS! Replica set initialized and primary elected!');
                            console.log('✅ Primary node:', primary.name);
                            console.log('✅ State:', status.members[0].stateStr);
                            console.log('');
                            console.log('📋 MongoDB Configuration:');
                            console.log('   URI: mongodb://127.0.0.1:27018/?replicaSet=rs0');
                            console.log('   Port: 27018');
                            console.log('   Replica Set: rs0');
                            console.log('');
                            console.log('🧪 MongoDB is now ready for ACID transactions!');
                            return true;
                        }
                        
                        // Show progress
                        if (i % 5 === 0) {
                            console.log(`   ... still waiting (${Math.floor((i * 2) / 60 * 100)}% of timeout)`);
                        }
                        
                    } catch (e) {
                        // Still in election process, continue waiting
                        if (i % 10 === 0) {
                            console.log(`   ... election in progress (${Math.floor((i * 2) / 60 * 100)}%)`);
                        }
                    }
                }
                
                console.log('');
                console.log('⚠️  Primary election taking longer than expected (2 minutes)');
                console.log('   This can be normal for first-time initialization');
                console.log('   The replica set may still complete initialization in the background');
                return false;
            } else {
                console.log('❌ Unexpected error:', error.message);
                return false;
            }
        }
    } catch (error) {
        console.log('❌ Failed to connect to MongoDB:', error.message);
        console.log('💡 Ensure MongoDB is running:');
        console.log('   mongod --replSet rs0 --port 27018 --dbpath "data\\mongodb-replica-27018"');
        return false;
    } finally {
        await client.close();
    }
}

// Run the initialization
console.log('🔧 MongoDB Replica Set Initializer');
console.log('===================================');
console.log('');

initializeReplicaSet()
    .then(success => {
        if (success) {
            console.log('🎯 Next Steps:');
            console.log('   1. Update .env: MONGODB_URI=mongodb://127.0.0.1:27018/?replicaSet=rs0');
            console.log('   2. Run: npm test tests/services/BaseService.transaction.test.js');
            console.log('   3. Verify all 23 tests pass with real transactions!');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.log('❌ Unexpected error:', error.message);
        process.exit(1);
    });