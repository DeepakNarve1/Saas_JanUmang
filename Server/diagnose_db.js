const mongoose = require("mongoose");
require("dotenv").config();

async function diagnose() {
  console.log("Starting diagnosis...");
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections.\n`);

    const stats = [];

    for (const col of collections) {
      const colName = col.name;
      console.log(`Processing collection: ${colName}...`);
      const collection = db.collection(colName);

      const count = await collection.countDocuments();
      const indexes = await collection.indexes();

      const hasCreatedAtIdx = indexes.some(
        (idx) => idx.key.createdAt !== undefined,
      );
      const hasTenantIdIdx = indexes.some(
        (idx) => idx.key.tenantId !== undefined,
      );

      stats.push({
        collection: colName,
        count,
        indexes: indexes.length,
        hasCreatedAtIdx,
        hasTenantIdIdx,
      });
    }

    // Sort by count descending
    stats.sort((a, b) => b.count - a.count);

    console.table(stats);

    console.log("\nTop 10 largest collections:");
    stats.slice(0, 10).forEach((s) => {
      console.log(
        `${s.collection}: ${s.count} docs, idx: ${s.indexes}, createdAtIdx: ${s.hasCreatedAtIdx}, tenantIdIdx: ${s.hasTenantIdIdx}`,
      );
    });

    process.exit(0);
  } catch (err) {
    console.error("Diagnosis failed:", err);
    process.exit(1);
  }
}

diagnose();
