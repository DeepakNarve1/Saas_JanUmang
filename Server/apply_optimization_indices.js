const mongoose = require("mongoose");
require("dotenv").config();

async function optimize() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;

    const optimizations = [
      {
        collection: "voters",
        indexes: [
          { createdAt: -1 },
          { tenantId: 1, createdAt: -1 },
          { isActive: 1 },
          { district: 1 },
          { block: 1 },
          { panchayat: 1 },
          { booth: 1 },
          { village: 1 },
        ],
      },
      {
        collection: "members",
        indexes: [
          { createdAt: -1 },
          { tenantId: 1, createdAt: -1 },
          { district: 1 },
          { block: 1 },
        ],
      },
      {
        collection: "publicproblems",
        indexes: [
          { createdAt: -1 },
          { tenantId: 1, createdAt: -1 },
          { status: 1 },
          { submissionDate: -1 },
        ],
      },
      {
        collection: "assemblyissues",
        indexes: [
          { createdAt: -1 },
          { tenantId: 1, createdAt: -1 },
          { status: 1 },
        ],
      },
      {
        collection: "activitylogs",
        indexes: [
          { createdAt: -1 },
          { tenantId: 1, createdAt: -1 },
          { module: 1 },
          { action: 1 },
        ],
      },
      {
        collection: "visitors",
        indexes: [{ createdAt: -1 }, { tenantId: 1, createdAt: -1 }],
      },
      {
        collection: "dispatchregisters",
        indexes: [
          { createdAt: -1 },
          { tenantId: 1, createdAt: -1 },
          { date: -1 },
        ],
      },
      {
        collection: "inwardregisters",
        indexes: [
          { createdAt: -1 },
          { tenantId: 1, createdAt: -1 },
          { date: -1 },
        ],
      },
      {
        collection: "users",
        indexes: [{ tenantId: 1 }, { level: 1 }, { status: 1 }],
      },
    ];

    for (const opt of optimizations) {
      console.log(`\nOptimizing collection: ${opt.collection}`);
      const collection = db.collection(opt.collection);

      // Get existing indexes
      let existing;
      try {
        existing = await collection.indexes();
      } catch (e) {
        console.log(`Skipping ${opt.collection}: ${e.message}`);
        continue;
      }

      for (const idxKey of opt.indexes) {
        const idxName = Object.keys(idxKey)
          .map((k) => `${k}_${idxKey[k]}`)
          .join("_");

        const alreadyExists = existing.some((ex) => {
          const exKeys = Object.keys(ex.key);
          const optKeys = Object.keys(idxKey);
          if (exKeys.length !== optKeys.length) return false;
          return optKeys.every((k) => ex.key[k] === idxKey[k]);
        });

        if (alreadyExists) {
          console.log(`  [ ] Index ${idxName} already exists.`);
        } else {
          console.log(`  [+] Creating index ${idxName}...`);
          try {
            await collection.createIndex(idxKey, { background: true });
          } catch (e) {
            console.error(
              `  [-] Failed to create index ${idxName}: ${e.message}`,
            );
          }
        }
      }
    }

    console.log("\nOptimization complete!");
    process.exit(0);
  } catch (err) {
    console.error("Optimization failed:", err);
    process.exit(1);
  }
}

optimize();
