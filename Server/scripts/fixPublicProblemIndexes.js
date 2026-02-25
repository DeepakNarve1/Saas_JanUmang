const mongoose = require("mongoose");
require("dotenv").config();

async function fixIndexes() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const collection = mongoose.connection.collection("publicproblems");

    // List current indexes
    console.log("\n📋 Current indexes:");
    const indexes = await collection.indexes();
    indexes.forEach((idx) => {
      console.log(
        `  - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? "(unique)" : ""}`,
      );
    });

    // Drop the old regNo_1 index
    console.log("\n🔧 Attempting to drop old regNo_1 index...");
    try {
      await collection.dropIndex("regNo_1");
      console.log("✅ Successfully dropped regNo_1 index");
    } catch (err) {
      if (err.code === 27) {
        console.log(
          "ℹ️  Index regNo_1 does not exist (already dropped or never existed)",
        );
      } else {
        throw err;
      }
    }

    // Verify remaining indexes
    console.log("\n📋 Remaining indexes:");
    const remainingIndexes = await collection.indexes();
    remainingIndexes.forEach((idx) => {
      console.log(
        `  - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.unique ? "(unique)" : ""}`,
      );
    });

    // Verify the compound index exists
    const hasCompoundIndex = remainingIndexes.some(
      (idx) => idx.name === "regNo_1_tenantId_1" && idx.unique,
    );

    if (hasCompoundIndex) {
      console.log(
        "\n✅ Compound index (regNo + tenantId) exists and is unique",
      );
    } else {
      console.log("\n⚠️  Warning: Compound index not found. Creating it...");
      await collection.createIndex(
        { regNo: 1, tenantId: 1 },
        { unique: true, name: "regNo_1_tenantId_1" },
      );
      console.log("✅ Created compound index");
    }

    console.log("\n🎉 Index fix complete!");
    console.log(
      "\nYou can now create public problems with different tenants using the same regNo.",
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  }
}

console.log("=".repeat(60));
console.log("  Public Problems Index Fix Script");
console.log("=".repeat(60));
console.log("\nThis script will:");
console.log("  1. Drop the old regNo_1 unique index");
console.log("  2. Keep the compound regNo_1_tenantId_1 unique index");
console.log("  3. Allow different tenants to have the same regNo\n");

fixIndexes();
