/**
 * Migration: Add in_docs permissions to all tenant_admin roles
 * Run from Server folder: node add_in_docs_permissions.js
 */
const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅  Connected to MongoDB:", mongoose.connection.name);

  const db = mongoose.connection.db;
  const permsCol = db.collection("permissions");
  const rolesCol = db.collection("roles");
  const tenantsCol = db.collection("tenants");

  // ── 1. Upsert the 4 in_docs Permission documents ──────────────────────────
  const permDefs = [
    {
      name: "view_in_docs",
      displayName: "View In Docs",
      description: "Can view outgoing document records",
      module: "in_docs",
      category: "view",
      isActive: true,
    },
    {
      name: "create_in_docs",
      displayName: "Create In Docs",
      description: "Can create outgoing document records",
      module: "in_docs",
      category: "create",
      isActive: true,
    },
    {
      name: "edit_in_docs",
      displayName: "Edit In Docs",
      description: "Can edit outgoing document records",
      module: "in_docs",
      category: "edit",
      isActive: true,
    },
    {
      name: "delete_in_docs",
      displayName: "Delete In Docs",
      description: "Can delete outgoing document records",
      module: "in_docs",
      category: "delete",
      isActive: true,
    },
  ];

  const permIds = [];
  for (const def of permDefs) {
    const existing = await permsCol.findOne({ name: def.name });
    if (existing) {
      console.log(
        `  ✔ Permission already exists: ${def.name} (${existing._id})`,
      );
      permIds.push(existing._id);
    } else {
      const result = await permsCol.insertOne({
        ...def,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(
        `  ➕ Created permission: ${def.name} (${result.insertedId})`,
      );
      permIds.push(result.insertedId);
    }
  }

  console.log(`\n  Permission IDs to inject: ${permIds.join(", ")}`);

  // ── 2. Add permissions to all tenant_admin roles ───────────────────────────
  const adminRoles = await rolesCol.find({ level: "tenant_admin" }).toArray();

  console.log(`\n  Found ${adminRoles.length} tenant_admin role(s)`);

  for (const role of adminRoles) {
    const result = await rolesCol.updateOne(
      { _id: role._id },
      {
        $addToSet: {
          permissions: { $each: permIds },
          modules: "in_docs",
        },
        $set: { updatedAt: new Date() },
      },
    );
    console.log(
      `  ✔ Role "${role.name}" (tenant: ${role.tenantId}) — modified: ${result.modifiedCount}`,
    );
  }

  // ── 3. Also add to custom roles that have inward_register or dispatch_register perms ─
  const docPerms = await permsCol
    .find({ module: { $in: ["inward_register", "dispatch_register"] } })
    .toArray();

  const docPermIds = docPerms.map((p) => p._id);
  console.log(
    `\n  Found ${docPermIds.length} inward/dispatch permission(s) to match against custom roles`,
  );

  if (docPermIds.length > 0) {
    const docRoles = await rolesCol
      .find({
        level: "custom",
        permissions: { $in: docPermIds },
      })
      .toArray();

    console.log(`  Found ${docRoles.length} matching custom role(s)`);

    for (const role of docRoles) {
      const result = await rolesCol.updateOne(
        { _id: role._id },
        {
          $addToSet: {
            permissions: { $each: permIds },
            modules: "in_docs",
          },
          $set: { updatedAt: new Date() },
        },
      );
      console.log(
        `  ✔ Custom role "${role.name}" (tenant: ${role.tenantId}) — modified: ${result.modifiedCount}`,
      );
    }
  }

  // ── 4. Add in_docs to enabledModules for all affected tenants ─────────────
  const tenantIds = adminRoles.map((r) => r.tenantId).filter(Boolean);

  if (tenantIds.length > 0) {
    const tenantResult = await tenantsCol.updateMany(
      { _id: { $in: tenantIds } },
      {
        $addToSet: { enabledModules: "in_docs" },
        $set: { updatedAt: new Date() },
      },
    );
    console.log(
      `\n  ✔ Added "in_docs" to enabledModules for ${tenantResult.modifiedCount} tenant(s)`,
    );
  }

  console.log("\n🎉  Migration complete!");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌  Error:", err.message);
  mongoose.disconnect();
  process.exit(1);
});
