const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function cleanup() {
  await mongoose.connect(MONGO_URI);

  // Find all modules used in permissions
  const permissions = await mongoose.connection.db
    .collection("permissions")
    .find({})
    .toArray();
  const dbModules = [...new Set(permissions.map((p) => p.module))];

  console.log("Modules found in database permissions:");
  dbModules.forEach((m) => console.log(`- ${m}`));

  const registryModules = [
    "dashboard",
    "users",
    "roles",
    "user_count",
    "activity_management",
    "mp_public_problems",
    "projects",
    "assembly_issues",
    "departments",
    "blocks",
    "villages",
    "panchayats",
    "booths",
    "states",
    "divisions",
    "districts",
    "parliaments",
    "assemblies",
    "samiti",
    "parties",
    "work_types",
    "sub_work_types",
    "members",
    "voters",
    "phone_directory",
    "events",
    "visitors",
    "call_management",
    "inward_register",
    "dispatch_register",
    "ganesh_samiti",
    "tenkar_samiti",
    "dp_samiti",
    "mandir_samiti",
    "bhagoria_samiti",
    "nirman_samiti",
    "booth_samiti",
    "block_samiti",
  ];

  const staleModules = dbModules.filter((m) => !registryModules.includes(m));

  if (staleModules.length > 0) {
    console.log("\nStale modules detected (not in registry):");
    staleModules.forEach((m) => console.log(`- ${m}`));

    // Deleting permissions for stale modules
    console.log("\nDeleting permissions for stale modules...");
    const result = await mongoose.connection.db
      .collection("permissions")
      .deleteMany({
        module: { $in: staleModules },
      });
    console.log(`Deleted ${result.deletedCount} stale permissions.`);
  } else {
    console.log("\nNo stale modules found in database.");
  }

  process.exit(0);
}
cleanup();
