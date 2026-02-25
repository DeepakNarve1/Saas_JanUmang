const mongoose = require("mongoose");
const fs = require("fs");

// Hardcoded URI
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function verify() {
  let output = "";
  const log = (msg) => {
    console.log(msg);
    output += msg + "\n";
  };

  try {
    log("Connecting...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    log("✅ Connected");

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

    log(`\nPermission Counts:`);
    log(`- 'view_panchayat' (singular): ${singular}`);
    log(`- 'view_panchayats' (plural): ${plural}`);

    // Check Roles
    const roles = await Role.find({ name: "tenant_admin" }).populate(
      "permissions",
    );
    log(`\nChecking tenant_admin roles:`);
    for (const r of roles) {
      if (!r.permissions) {
        log(`- Role ${r._id}: No permissions array`);
        continue;
      }
      const perms = r.permissions.map((p) => p.name);
      const hasSingular = perms.includes("view_panchayat");
      const hasPlural = perms.includes("view_panchayats");
      log(`- Role ${r._id}: Singular=${hasSingular}, Plural=${hasPlural}`);
    }

    fs.writeFileSync("verify_output.txt", output);
    process.exit(0);
  } catch (e) {
    log(e.stack);
    fs.writeFileSync("verify_output.txt", output);
    process.exit(1);
  }
}

verify();
