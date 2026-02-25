const mongoose = require("mongoose");

// Hardcoded URI
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

const log = console.log;

const PermissionSchema = new mongoose.Schema(
  {
    name: String,
    displayName: String,
    category: String,
  },
  { strict: false },
);
const Permission =
  mongoose.models.Permission || mongoose.model("Permission", PermissionSchema);

const RoleSchema = new mongoose.Schema(
  {
    name: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
    sidebarAccess: [String],
    tenantId: mongoose.Schema.Types.ObjectId,
  },
  { strict: false },
);
const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);

async function forceFix() {
  try {
    log("Connecting...");
    await mongoose.connect(MONGO_URI);
    log("✅ Connected");

    // 1. Ensure Permission 'view_panchayats'
    let pluralPerm = await Permission.findOne({ name: "view_panchayats" });
    if (!pluralPerm) {
      log("Creating 'view_panchayats' permission...");
      pluralPerm = await Permission.create({
        name: "view_panchayats",
        displayName: "View Panchayats",
        category: "panchayats",
      });
      log(`Created: ${pluralPerm._id}`);
    } else {
      log(`Found existing 'view_panchayats': ${pluralPerm._id}`);
    }

    // 2. Ensure Permission 'view_panchayat' (singular) for legacy safety?
    // Actually, let's remove it or ignore it, but we MUST ensure roles have PLURAL.

    // 3. Update Roles
    const roles = await Role.find({ name: "tenant_admin" });
    log(`Found ${roles.length} tenant_admin roles.`);

    for (const r of roles) {
      log(`Processing role ${r._id} (${r.name})...`);

      if (!r.permissions) r.permissions = [];

      // Convert existing to strings for comparison
      const currentPerms = r.permissions.map((p) => p.toString());
      const targetId = pluralPerm._id.toString();

      if (!currentPerms.includes(targetId)) {
        log(`- Adding 'view_panchayats' (${targetId})`);
        r.permissions.push(pluralPerm._id);
        await r.save();
        log(`  Saved.`);
      } else {
        log(`- Already has 'view_panchayats'.`);
      }
    }

    log("Done.");
    process.exit(0);
  } catch (e) {
    log("❌ Error: " + e.stack);
    process.exit(1);
  }
}

forceFix();
