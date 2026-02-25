const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;
console.log(
  "MONGO_URI:",
  MONGO_URI ? MONGO_URI.substring(0, 40) + "..." : "NOT FOUND",
);

if (!MONGO_URI) {
  console.error("ERROR: MONGO_URI not set in .env");
  process.exit(1);
}

async function run() {
  try {
    console.log("Connecting...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("[OK] Connected to MongoDB");

    const db = mongoose.connection.db;
    const col = db.collection("roles");

    // 1. List all current indexes
    const before = await col.indexes();
    console.log('\n--- Current indexes on "roles" ---');
    before.forEach((i) =>
      console.log(
        " ",
        JSON.stringify(i.name),
        JSON.stringify(i.key),
        i.unique ? "(unique)" : "",
      ),
    );

    // 2. Drop ALL unique indexes on { name, ... }
    const toDrop = before.filter(
      (i) => i.name !== "_id_" && i.unique && i.key.name !== undefined,
    );

    for (const idx of toDrop) {
      console.log(`\nDropping index "${idx.name}" ...`);
      await col.dropIndex(idx.name);
      console.log("  -> Dropped.");
    }

    // 3. Recreate the correct unique index (one per name per tenant)
    console.log(
      "\nCreating new partial unique index { name:1, tenantId:1 } where isDeleted != true ...",
    );
    await col.createIndex(
      { name: 1, tenantId: 1 },
      {
        name: "role_name_tenantId_unique",
        unique: true,
        partialFilterExpression: { isDeleted: { $ne: true } },
      },
    );
    console.log("  -> Index created.");

    // 4. Show any "developer" docs for diagnosis
    const devRoles = await col.find({ name: "developer" }).toArray();
    console.log(`\n--- Roles named "developer" (${devRoles.length} total) ---`);
    devRoles.forEach((r) => {
      console.log(
        `  _id:${r._id}  tenantId:${r.tenantId || "null"}  isDeleted:${r.isDeleted}`,
      );
    });

    // 5. Final index list
    const after = await col.indexes();
    console.log("\n--- Indexes after migration ---");
    after.forEach((i) =>
      console.log(
        " ",
        i.name,
        JSON.stringify(i.key),
        i.unique ? "(unique)" : "",
      ),
    );

    console.log("\n[DONE]");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n[ERROR]", err.message);
    process.exit(1);
  }
}

run();
