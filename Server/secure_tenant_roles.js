const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function secureRoles() {
  await mongoose.connect(MONGO_URI);

  console.log("Securing Organization Admin roles...");
  const result = await mongoose.connection.db
    .collection("roles")
    .updateMany(
      { level: "tenant_admin", name: "tenant_admin" },
      { $set: { isSystem: true } },
    );

  console.log(`Updated ${result.modifiedCount} roles to 'System' status.`);

  // Verify
  const roles = await mongoose.connection.db
    .collection("roles")
    .find({ level: "tenant_admin" })
    .toArray();
  console.log("\nCurrent Organization Admin status:");
  roles.forEach((r) => {
    console.log(
      `- Role: ${r.displayName}, Tenant: ${r.tenantId}, isSystem: ${r.isSystem}`,
    );
  });

  process.exit(0);
}
secureRoles();
