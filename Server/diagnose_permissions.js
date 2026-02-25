const mongoose = require("mongoose");

// Hardcoded URI
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

const log = console.log;

// Use correct schema
const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    // Add minimal fields required by DB schema to avoid strict errors if schema compiled with them
    displayName: String,
    module: String,
  },
  { strict: false },
);
// Use existing model to check what collection it uses
const Permission =
  mongoose.models.Permission || mongoose.model("Permission", permissionSchema);

const roleSchema = new mongoose.Schema(
  {
    name: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  },
  { strict: false },
);
const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

async function diagnose() {
  try {
    log("Connecting...");
    await mongoose.connect(MONGO_URI);
    log("✅ Connected");

    // 1. List ALL Permissions related to 'panchayat'
    const perms = await Permission.find({ name: /panchayat/i });
    log(`Found ${perms.length} 'panchayat' related permissions:`);
    perms.forEach((p) => log(`- ID: ${p._id}, Name: ${p.name}`));

    // 2. Check tenant_admin roles
    const roles = await Role.find({});
    for (const r of roles) {
      log(`Role: ${r.name} (${r._id})`);
      if (r.permissions && r.permissions.length > 0) {
        const pids = r.permissions.map((p) => p.toString());
        const rolePerms = await Permission.find({ _id: { $in: pids } });
        const panchayatPerms = rolePerms.filter((p) =>
          p.name.includes("panchayat"),
        );
        if (panchayatPerms.length > 0) {
          log(
            `  - Has Panchayat perms: ${panchayatPerms.map((p) => p.name).join(", ")}`,
          );
        } else {
          log(`  - No Panchayat perms found.`);
        }
      } else {
        log(`  - No permissions assigned.`);
      }
    }

    process.exit(0);
  } catch (e) {
    log("Error: " + e.stack);
    process.exit(1);
  }
}

diagnose();
