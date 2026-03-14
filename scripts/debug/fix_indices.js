const mongoose = require("mongoose");
require("dotenv").config();

const fixIndices = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/JanUmangSaas",
    );
    console.log("Connected to MongoDB");

    const collections = await conn.connection.db.listCollections().toArray();

    for (const col of collections) {
      const collection = conn.connection.db.collection(col.name);
      const indices = await collection.indexes();

      console.log(`\nChecking collection: ${col.name}`);

      for (const index of indices) {
        // If we find a unique index on 'name' or 'uniqueId' or 'code' that DOES NOT include 'tenantId'
        const keys = Object.keys(index.key);
        const isUnique = index.unique;

        const problemKeys = ["name", "uniqueId", "code", "voterId"];
        const hasProblemKey = keys.some((k) => problemKeys.includes(k));
        const hasTenantId = keys.includes("tenantId");

        if (
          isUnique &&
          hasProblemKey &&
          !hasTenantId &&
          index.name !== "_id_"
        ) {
          console.log(
            `[!] Found problematic global unique index: ${index.name} on ${col.name}`,
          );
          try {
            await collection.dropIndex(index.name);
            console.log(`[+] Dropped index ${index.name}`);
          } catch (e) {
            console.error(
              `[-] Failed to drop index ${index.name}: ${e.message}`,
            );
          }
        }
      }
    }

    console.log("\nIndex cleanup complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

fixIndices();
