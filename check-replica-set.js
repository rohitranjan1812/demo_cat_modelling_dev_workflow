const { MongoClient } = require('mongodb');

async function checkAndInitializeReplicaSet() {
    const client = new MongoClient('mongodb://localhost:27017');
    
    try {
        console.log('🔍 Checking MongoDB replica set status...');
        await client.connect();
        
        const admin = client.db('admin');
        
        // First, check if replica set is already initialized
        try {
            const status = await admin.command({ replSetGetStatus: 1 });
            console.log('✅ Replica set already initialized');
            const primary = status.members.find(m => m.stateStr === 'PRIMARY');
            if (primary) {
                console.log('✅ Primary node:', primary.name);
                console.log('🎉 MongoDB is ready for transactions!');
                return true;
            } else {
                console.log('⏳ Waiting for primary election...');
                return false;
            }
        } catch (error) {
            if (error.message.includes('no replset config')) {
                console.log('🔧 MongoDB running with --replSet but needs initialization...');
                
                // Initialize replica set
                const config = {
                    _id: 'rs0',
                    members: [{ _id: 0, host: 'localhost:27017' }]
                };
                
                console.log('🚀 Initializing replica set...');
                const result = await admin.command({ replSetInitiate: config });
                console.log('✅ Replica set initialization started');
                
                // Wait for primary election
                console.log('⏳ Waiting for primary election...');
                for (let i = 0; i < 60; i++) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        const status = await admin.command({ replSetGetStatus: 1 });
                        const primary = status.members.find(m => m.stateStr === 'PRIMARY');
                        if (primary) {
                            console.log('✅ Primary elected:', primary.name);
                            console.log('🎉 MongoDB replica set is ready for transactions!');
                            return true;
                        }
                        process.stdout.write('.');
                    } catch (e) {
                        // Still in election process
                        process.stdout.write('.');
                    }
                }
                
                console.log('\n⚠️  Primary election is taking longer than expected');
                console.log('   The replica set may still be initializing...');
                return false;
            } else {
                console.log('❌ Error:', error.message);
                if (error.message.includes('not running with --replSet')) {
                    console.log('💡 MongoDB is not running with replica set configuration');
                    console.log('   Please restart MongoDB with --replSet rs0 parameter');
                }
                return false;
            }
        }
    } catch (error) {
        console.log('❌ Failed to connect to MongoDB:', error.message);
        console.log('💡 Make sure MongoDB is running on localhost:27017');
        return false;
    } finally {
        await client.close();
    }
}

// Run the check and initialization
checkAndInitializeReplicaSet()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.log('❌ Unexpected error:', error.message);
        process.exit(1);
    });