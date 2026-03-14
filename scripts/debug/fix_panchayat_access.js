const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "Server", ".env") });

const log = console.log;

// Minimal Schemas
const PermissionSchema = new mongoose.Schema({
  name: String,
  displayName: String,
  category: String,
});
const Permission = mongoose.model("Permission", PermissionSchema);

const RoleSchema = new mongoose.Schema({
  name: String,
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  sidebarAccess: [String],
  tenantId: mongoose.Schema.Types.ObjectId, // loose ref
});
const Role = mongoose.model("Role", RoleSchema);

const TenantSchema = new mongoose.Schema({
  name: String,
  enabledModules: [String],
});
const Tenant = mongoose.model("Tenant", TenantSchema);

async function fixAccess() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from environment");
    }

    log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    log("✅ Connected");

    // 1. Ensure Permission Exists
    let perm = await Permission.findOne({ name: "view_panchayats" });
    if (!perm) {
      log("⚠️ 'view_panchayats' permission not found. Creating...");
      perm = await Permission.create({
        name: "view_panchayats",
        displayName: "View Panchayats",
        category: "panchayats",
      });
      log("✅ Created permission");
    } else {
      log(`✅ Found 'view_panchayats' permission (${perm._id})`);
    }

    // 2. Fix Tenants (Enabled Modules)
    const tenants = await Tenant.find({});
    log(`Checking ${tenants.length} tenants...`);

    for (const t of tenants) {
      let changed = false;
      if (!t.enabledModules) t.enabledModules = [];

      // Ensure 'panchayats' (plural) is present
      if (!t.enabledModules.includes("panchayats")) {
        t.enabledModules.push("panchayats");
        changed = true;
        log(`- [${t.name}] Added 'panchayats' to enabledModules`);
      }

      if (changed) await t.save();
    }
    log("✅ Tenants validated.");

    // 3. Fix Roles (Permissions & Sidebar)
    const roles = await Role.find({});
    log(`Checking ${roles.length} roles...`);

    const TARGET_ROLES = ["tenant_admin", "superadmin", "system_admin"];
    // Maybe custom roles too? For now focusing on admins as per user request

    for (const r of roles) {
      let changed = false;

      // Only checking logic for relevant roles or if they already have permissions
      // If it's a tenant_admin, we MUST fix it.
      if (TARGET_ROLES.includes(r.name) || r.name.includes("admin")) {
        // A. Add Permission
        // Convert ObjectIds to strings for comparison
        const permIds = r.permissions.map((p) => p.toString());
        if (!permIds.includes(perm._id.toString())) {
          r.permissions.push(perm._id);
          changed = true;
          log(`- [Role: ${r.name}] Added 'view_panchayats' permission`);
        }

        // B. Fix Sidebar Access (if it exists or is restricted)
        // If sidebarAccess is empty, it usually means "all access" or "no access" depending on implementation.
        // But usePermissions.ts says: if (role.sidebarAccess?.includes("*")) ... defined check logic.
        // If sidebarAccess is defined and not containing *, we must add the path.

        if (r.sidebarAccess && Array.isArray(r.sidebarAccess)) {
          const hasWildcard = r.sidebarAccess.includes("*");
          if (!hasWildcard) {
            // It's a restricted list, so we must add /panchayat
            if (!r.sidebarAccess.includes("/panchayat")) {
              r.sidebarAccess.push("/panchayat");
              changed = true;
              log(`- [Role: ${r.name}] Added '/panchayat' to sidebarAccess`);
            }
            // Also add /panchayats just in case of typo in other places (though checking code says /panchayat)
            if (!r.sidebarAccess.includes("/panchayats")) {
              r.sidebarAccess.push("/panchayats");
              changed = true;
              log(`- [Role: ${r.name}] Added '/panchayats' to sidebarAccess`);
            }
          }
        }
      }

      if (changed) await r.save();
    }

    log("✅ Roles validated.");
    log("Done.");
    process.exit(0);
  } catch (e) {
    log("❌ Error: " + e.stack);
    process.exit(1);
  }
}

fixAccess();
