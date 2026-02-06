const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load Environment Variables
dotenv.config({ path: path.join(__dirname, "../.env") });

async function migrate() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 Connected to MongoDB successfully!");

    const db = mongoose.connection.db;

    // 1. Create Default Tenant if it doesn't exist
    const tenantsCollection = db.collection("tenants");
    let defaultTenant = await tenantsCollection.findOne({ slug: "default" });

    if (!defaultTenant) {
      const result = await tenantsCollection.insertOne({
        name: "Default Organization",
        slug: "default",
        plan: "Enterprise",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      defaultTenant = { _id: result.insertedId };
      console.log("✅ Created Default Tenant with ID:", defaultTenant._id);
    } else {
      console.log("ℹ️  Using existing Default Tenant:", defaultTenant._id);
    }

    const tenantId = defaultTenant._id;

    // 2. Define collections that SHOULD be tenant-isolated
    // Note: Collection names in MongoDB are usually lowercase and pluralized by Mongoose
    const tenantIsolatedCollections = [
      "users",
      "roles",
      "voters",
      "assemblyissues",
      "activitylogs",
      "events",
      "indocs",
      "inwardregisters",
      "dispatchregisters",
      "callmanagements",
      "publicproblems",
      "samitis",
      "samitilists",
      "visitors",
      "members",
      "phonedirectories",
      "sidebaraccesses",
      "projectmodels", // or projects? check name
      "vidhansabhasamitis",
    ];

    // 3. Get all collections from DB to check actual names
    const collections = await db.listCollections().toArray();
    const actualCollectionNames = collections.map((c) => c.name);

    console.log("\n--- Starting Migration ---");

    for (const collectionName of actualCollectionNames) {
      // Skip if collection is not in our isolated list or is master data
      // We'll be proactive: tag anything that isn't master data or tenants
      const masterDataPrefixes = [
        "tenants",
        "permissions",
        "states",
        "divisions",
        "districts",
        "parliaments",
        "assemblies",
        "blocks",
        "booths",
        "panchayats",
        "villages",
        "worktypes",
        "subtypeofworks",
        "departments",
        "partys",
        "vidhansabhas",
      ];

      if (
        masterDataPrefixes.some((prefix) => collectionName.startsWith(prefix))
      ) {
        console.log(`⏩ Skipping master data collection: ${collectionName}`);
        continue;
      }

      console.log(`🔍 Migrating collection: ${collectionName}...`);

      const result = await db
        .collection(collectionName)
        .updateMany(
          { tenantId: { $exists: false } },
          { $set: { tenantId: tenantId } },
        );

      if (result.modifiedCount > 0) {
        console.log(
          `   ✅ Updated ${result.modifiedCount} documents in ${collectionName}`,
        );
      } else {
        console.log(`   ℹ️  No documents needed update in ${collectionName}`);
      }
    }

    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);
    process.exit(1);
  }
}

migrate();
