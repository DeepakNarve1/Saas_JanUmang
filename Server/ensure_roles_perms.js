const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function fix() {
  await mongoose.connect(MONGO_URI);
  const Permission = mongoose.connection.db.collection("permissions");

  const rolesPerms = [
    { name: "view_roles", displayName: "View Roles", module: "roles" },
    { name: "create_roles", displayName: "Create Roles", module: "roles" },
    { name: "edit_roles", displayName: "Edit Roles", module: "roles" },
    { name: "delete_roles", displayName: "Delete Roles", module: "roles" },
    { name: "manage_roles", displayName: "Process Roles", module: "roles" },
  ];

  for (const p of rolesPerms) {
    await Permission.updateOne(
      { name: p.name },
      { $set: { ...p, isActive: true } },
      { upsert: true },
    );
  }

  console.log("Ensured 5 roles permissions exist.");
  process.exit(0);
}
fix();
