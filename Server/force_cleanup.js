const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function cleanup() {
  await mongoose.connect(MONGO_URI);

  const staleModules = ["ward", "in_docs", "sidebar_permissions"];

  console.log("Cleaning up stale modules:", staleModules);
  const result = await mongoose.connection.db
    .collection("permissions")
    .deleteMany({
      module: { $in: staleModules },
    });
  console.log(`Deleted ${result.deletedCount} permissions for stale modules.`);

  // also check if any roles have these modules listed
  const rolesUpdate = await mongoose.connection.db
    .collection("roles")
    .updateMany(
      { modules: { $in: staleModules } },
      { $pull: { modules: { $in: staleModules } } },
    );
  console.log(
    `Updated ${rolesUpdate.modifiedCount} roles to remove stale modules.`,
  );

  process.exit(0);
}
cleanup();
