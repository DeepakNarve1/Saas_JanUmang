const mongoose = require("mongoose");
require("dotenv").config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    console.log("Connected to DB:", mongoose.connection.name);

    const collections = [
      "samitilists",
      "parties",
      "departments",
      "worktypes",
      "subtypeofworks",
    ];

    for (const colName of collections) {
      const collection = db.collection(colName);
      try {
        const indexes = await collection.indexes();
        console.log(`\nIndexes for ${colName}:`);
        for (const idx of indexes) {
          console.log(
            ` - ${idx.name}: ${JSON.stringify(idx.key)} (Unique: ${idx.unique || false})`,
          );

          // Drop global unique indexes on 'name' or 'uniqueId'
          if (
            idx.unique &&
            (idx.key.name || idx.key.uniqueId || idx.key.code) &&
            !idx.key.tenantId &&
            idx.name !== "_id_"
          ) {
            console.log(`   [!!!] DROPPING GLOBAL UNIQUE INDEX: ${idx.name}`);
            await collection.dropIndex(idx.name);
          }
        }
      } catch (e) {
        console.log(`   Error processing ${colName}: ${e.message}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("CRITICAL ERROR:", err);
    process.exit(1);
  }
}
run();
