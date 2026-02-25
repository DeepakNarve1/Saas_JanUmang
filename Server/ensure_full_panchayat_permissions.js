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

async function ensurePermissions() {
  try {
    log("Connecting...");
    await mongoose.connect(MONGO_URI);
    log("✅ Connected");

    const requiredPerms = [
      { name: "view_panchayats", disp: "View Panchayats" },
      { name: "create_panchayats", disp: "Create Panchayats" },
      { name: "edit_panchayats", disp: "Edit Panchayats" },
      { name: "delete_panchayats", disp: "Delete Panchayats" },
    ];

    const permIds = [];

    // 1. Create/Find Permissions
    for (const p of requiredPerms) {
      let perm = await Permission.findOne({ name: p.name });
      if (!perm) {
        log(`Creating '${p.name}'...`);
        perm = await Permission.create({
          name: p.name,
          displayName: p.disp,
          category: "panchayats",
        });
        log(`- Created ${perm._id}`);
      } else {
        log(`Found '${p.name}' (${perm._id})`);
      }
      permIds.push(perm._id);
    }

    // 2. Update tenant_admin Roles
    const roles = await Role.find({ name: "tenant_admin" });
    log(`Found ${roles.length} tenant_admin roles.`);

    for (const r of roles) {
      let changed = false;
      if (!r.permissions) r.permissions = [];

      const currentIds = r.permissions.map((id) => id.toString());

      for (const pid of permIds) {
        const sid = pid.toString();
        if (!currentIds.includes(sid)) {
          r.permissions.push(pid);
          changed = true;
          log(`- [Role: ${r._id}] Adding permission: ${sid}`);
        }
      }

      if (changed) {
        await r.save();
        log(`  Saved role ${r._id}`);
      } else {
        log(`- Role ${r._id} already has full access.`);
      }
    }

    log("Done.");
    process.exit(0);
  } catch (e) {
    log("❌ Error: " + e.stack);
    process.exit(1);
  }
}

ensurePermissions();
