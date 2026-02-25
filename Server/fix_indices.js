const mongoose = require("mongoose");
require("dotenv").config();

const fixIndices = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not found in environment.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB: ${conn.connection.name}`);

    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections.`);

    for (const col of collections) {
      const collection = conn.connection.db.collection(col.name);
      let indices;
      try {
        indices = await collection.indexes();
      } catch (e) {
        console.log(`Could not get indexes for ${col.name}: ${e.message}`);
        continue;
      }

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
            `[!] Found problematic global unique index: ${index.name} on ${col.name} keys: ${JSON.stringify(index.key)}`,
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
