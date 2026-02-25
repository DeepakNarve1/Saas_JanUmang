const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;

    const results = [];
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      const collection = db.collection(col.name);
      const indexes = await collection.indexes();
      for (const idx of indexes) {
        if (
          idx.unique &&
          (idx.key.name || idx.key.uniqueId || idx.key.code) &&
          !idx.key.tenantId &&
          idx.name !== "_id_"
        ) {
          results.push(`Dropping ${idx.name} on ${col.name}`);
          await collection.dropIndex(idx.name);
        }
      }
    }
    fs.writeFileSync(
      "fix_results.txt",
      results.join("\n") || "No global unique indexes found.",
    );
    process.exit(0);
  } catch (err) {
    fs.writeFileSync("fix_results.txt", "ERROR: " + err.message);
    process.exit(1);
  }
}
run();
