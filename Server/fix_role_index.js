const mongoose = require("mongoose");
require("dotenv").config();

async function fixRoleIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const db = mongoose.connection.db;
    const collection = db.collection("roles");

    console.log("Checking indexes on roles...");
    const indexes = await collection.indexes();
    console.log("Current indexes:", JSON.stringify(indexes, null, 2));

    // Find the name_1_tenantId_1 index
    const targetIndex = indexes.find((idx) => idx.name === "name_1_tenantId_1");

    if (targetIndex) {
      console.log("Dropping existing unique index name_1_tenantId_1...");
      await collection.dropIndex("name_1_tenantId_1");
      console.log("Index dropped successfully.");
    } else {
      console.log(
        "Unique index name_1_tenantId_1 not found by name. Checking keys...",
      );
      const keyIndex = indexes.find(
        (idx) => idx.key.name === 1 && idx.key.tenantId === 1,
      );
      if (keyIndex) {
        console.log(`Dropping index ${keyIndex.name}...`);
        await collection.dropIndex(keyIndex.name);
      }
    }

    console.log("Creating new partial unique index...");
    await collection.createIndex(
      { name: 1, tenantId: 1 },
      {
        unique: true,
        partialFilterExpression: { isDeleted: false },
        name: "name_1_tenantId_1",
      },
    );
    console.log("New index created successfully.");

    process.exit(0);
  } catch (err) {
    console.error("FAILED:", err);
    process.exit(1);
  }
}

fixRoleIndex();
