const mongoose = require("mongoose");

// Hardcoded URI
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

const log = console.log;

// Minimal Schemas
const PermissionSchema = new mongoose.Schema({
  name: String,
  displayName: String,
});
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

async function fixAccess() {
  try {
    log("Connecting...");
    await mongoose.connect(MONGO_URI);
    log("✅ Connected");

    let perm = await Permission.findOne({ name: "view_panchayats" });
    if (!perm) {
      log("Permission 'view_panchayats' missing! Creating...");
      perm = await Permission.create({
        name: "view_panchayats",
        displayName: "View Panchayats",
        category: "panchayats",
      });
      log(`Created permission: ${perm._id}`);
    } else {
      log(`Found permission: ${perm._id}`);
    }

    // Find Tenant Admin Roles
    const roles = await Role.find({ name: "tenant_admin" });
    log(`Found ${roles.length} tenant_admin roles.`);

    for (const r of roles) {
      let changed = false;

      // 1. Add Permission
      if (!r.permissions) r.permissions = [];
      const pid = perm._id.toString();
      const existing = r.permissions.map((p) => p.toString());

      if (!existing.includes(pid)) {
        log(`- Adding permission to role ${r._id}`);
        r.permissions.push(perm._id);
        changed = true;
      }

      // 2. Fix Sidebar Access
      // Some tenants might have strict sidebar access listing every path
      if (
        r.sidebarAccess &&
        Array.isArray(r.sidebarAccess) &&
        !r.sidebarAccess.includes("*") &&
        r.sidebarAccess.length > 0
      ) {
        if (!r.sidebarAccess.includes("/panchayat")) {
          log(`- Adding '/panchayat' to sidebar for role ${r._id}`);
          r.sidebarAccess.push("/panchayat");
          changed = true;
        }
      }

      if (changed) {
        await r.save();
        log(`✅ Saved role ${r._id}`);
      } else {
        log(`- Role ${r._id} already okay.`);
      }
    }

    process.exit(0);
  } catch (e) {
    log("❌ Error: " + e.stack);
    process.exit(1);
  }
}

fixAccess();
