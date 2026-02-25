const mongoose = require("mongoose");
require("dotenv").config();

async function cleanup() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections.`);

    for (const col of collections) {
      const colName = col.name;
      const collection = db.collection(colName);

      try {
        const indexes = await collection.indexes();
        console.log(`\nCollection: ${colName}`);

        for (const idx of indexes) {
          const keys = Object.keys(idx.key);
          const isUnique = idx.unique;
          const hasTenantId = keys.includes("tenantId");
          const hasName = keys.includes("name");
          const hasUniqueId = keys.includes("uniqueId");
          const hasCode = keys.includes("code");

          // If it's a unique index on a common field but MISSING tenantId
          if (
            isUnique &&
            (hasName || hasUniqueId || hasCode) &&
            !hasTenantId &&
            idx.name !== "_id_"
          ) {
            console.log(
              `  [!] DROPPING global unique index: ${idx.name} on ${colName}`,
            );
            await collection.dropIndex(idx.name);
          } else {
            console.log(`  [ ] Keeping index: ${idx.name}`);
          }
        }
      } catch (e) {
        console.log(`  Error on ${colName}: ${e.message}`);
      }
    }

    console.log("\nCleanup finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Cleanup failed:", err);
    process.exit(1);
  }
}

cleanup();
