const mongoose = require("mongoose");

// Hardcoded URI
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function verify() {
  try {
    console.log("Connecting...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    const Permission =
      mongoose.models.Permission ||
      mongoose.model(
        "Permission",
        new mongoose.Schema({ name: String }, { strict: false }),
      );
    const Role =
      mongoose.models.Role ||
      mongoose.model(
        "Role",
        new mongoose.Schema(
          {
            name: String,
            permissions: [
              { type: mongoose.Schema.Types.ObjectId, ref: "Permission" },
            ],
          },
          { strict: false },
        ),
      );

    // Check Permissions
    const singular = await Permission.countDocuments({
      name: "view_panchayat",
    });
    const plural = await Permission.countDocuments({ name: "view_panchayats" });

    console.log(`\nPermission Counts:`);
    console.log(`- 'view_panchayat' (singular): ${singular}`);
    console.log(`- 'view_panchayats' (plural): ${plural}`);

    // Check Roles
    const roles = await Role.find({ name: "tenant_admin" }).populate(
      "permissions",
    );
    console.log(`\nChecking tenant_admin roles:`);
    for (const r of roles) {
      const perms = r.permissions.map((p) => p.name);
      const hasSingular = perms.includes("view_panchayat");
      const hasPlural = perms.includes("view_panchayats");
      console.log(
        `- Role ${r._id}: Singular=${hasSingular}, Plural=${hasPlural}`,
      );
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

verify();
