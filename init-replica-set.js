// MongoDB Replica Set Initialization
print("🔧 Initializing replica set...");

rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "localhost:27017" }
  ]
});

print("✅ Replica set initialized");
print("🧪 Testing transactions...");

// Test transaction capability
var session = db.getMongo().startSession();
session.startTransaction();
try {
  db.test.insertOne({test: "transaction", timestamp: new Date()}, {session: session});
  session.commitTransaction();
  print("✅ Transaction test PASSED - ACID transactions enabled!");
  db.test.deleteOne({test: "transaction"});
} catch (e) {
  session.abortTransaction();
  print("❌ Transaction test failed:", e);
}
session.endSession();
