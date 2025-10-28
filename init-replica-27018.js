const { MongoClient } = require('mongodb');

async function initializeReplicaSet() {
    const client = new MongoClient('mongodb://localhost:27018');
    
    try {
        console.log('🔍 Connecting to MongoDB on port 27018...');
        await client.connect();
        console.log('✅ Connected successfully');
        
        const admin = client.db('admin');
        
        // Check if replica set is already initialized
        try {
            const status = await admin.command({ replSetGetStatus: 1 });
            console.log('✅ Replica set already initialized');
            const primary = status.members.find(m => m.stateStr === 'PRIMARY');
            if (primary) {
                console.log('✅ Primary node:', primary.name);
                console.log('🎉 MongoDB is ready for transactions!');
                return true;
            }
        } catch (error) {
            if (error.message.includes('no replset config')) {
                console.log('🔧 Initializing replica set...');
                
                // Initialize replica set
                const config = {
                    _id: 'rs0',
                    members: [{ _id: 0, host: 'localhost:27018' }]
                };
                
                const result = await admin.command({ replSetInitiate: config });
                console.log('✅ Replica set initialization command sent');
                
                // Wait for primary election
                console.log('⏳ Waiting for primary election...');
                for (let i = 0; i < 30; i++) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        const status = await admin.command({ replSetGetStatus: 1 });
                        const primary = status.members.find(m => m.stateStr === 'PRIMARY');
                        if (primary) {
                            console.log('');
                            console.log('✅ Primary elected:', primary.name);
                            console.log('✅ Replica set state:', status.members[0].stateStr);
                            console.log('🎉 MongoDB replica set is ready for transactions!');
                            console.log('');
                            console.log('📋 Connection Details:');
                            console.log('   URI: mongodb://localhost:27018/?replicaSet=rs0');
                            console.log('   Port: 27018');
                            console.log('   Replica Set: rs0');
                            console.log('');
                            return true;
                        }
                        process.stdout.write('.');
                    } catch (e) {
                        // Still in election process
                        process.stdout.write('.');
                    }
                }
                
                console.log('\n⚠️  Primary election is taking longer than expected');
                return false;
            } else {
                console.log('❌ Error:', error.message);
                return false;
            }
        }
    } catch (error) {
        console.log('❌ Failed to connect to MongoDB:', error.message);
        console.log('💡 Make sure MongoDB is running on localhost:27018');
        return false;
    } finally {
        await client.close();
    }
}

// Run the initialization
initializeReplicaSet()
    .then(success => {
        if (success) {
            console.log('🎯 Next step: Update your .env file to use port 27018');
            console.log('   MONGODB_URI=mongodb://localhost:27018/?replicaSet=rs0');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.log('❌ Unexpected error:', error.message);
        process.exit(1);
    });