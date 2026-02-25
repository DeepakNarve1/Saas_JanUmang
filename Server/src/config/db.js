const mongoose = require("mongoose");

/**
 * Automatically rebuild the roles unique index on startup.
 * This is safe to run every startup — it checks if the correct index already
 * exists and only rebuilds if needed. This avoids needing a manual migration step.
 */
async function ensureRoleIndex() {
  try {
    const col = mongoose.connection.db.collection("roles");
    const indexes = await col.indexes();

    // Check if our correct partial unique index already exists
    const correctIndex = indexes.find(
      (i) =>
        i.name === "role_name_tenantId_unique" ||
        (i.unique &&
          i.key.name === 1 &&
          i.key.tenantId === 1 &&
          i.partialFilterExpression),
    );

    if (correctIndex) {
      console.log("[DB] Role index is correct — no migration needed.");
      return;
    }

    console.log("[DB] Rebuilding roles unique index for multi-tenancy...");

    // Drop any unique index on the 'name' field (the old global one)
    const toDrop = indexes.filter(
      (i) => i.name !== "_id_" && i.unique && i.key.name !== undefined,
    );

    for (const idx of toDrop) {
      await col.dropIndex(idx.name);
      console.log(`[DB] Dropped stale index: ${idx.name}`);
    }

    // Create the correct partial unique index:
    // Same role name IS allowed across DIFFERENT tenants.
    // Same role name is BLOCKED within the SAME tenant (for non-deleted roles).
    await col.createIndex(
      { name: 1, tenantId: 1 },
      {
        name: "role_name_tenantId_unique",
        unique: true,
        partialFilterExpression: { isDeleted: { $ne: true } },
      },
    );

    console.log(
      "[DB] ✅ Role index rebuilt: same role names now allowed across different organizations.",
    );
  } catch (err) {
    console.error("[DB] Failed to ensure role index:", err.message);
    // Don't crash the server — log and continue
  }
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully!");

    // Run automatic index migrations
    await ensureRoleIndex();
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
