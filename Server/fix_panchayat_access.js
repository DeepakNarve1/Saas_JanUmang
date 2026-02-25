const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config(); // Loads .env from current directory (Server/)

const log = console.log;

// Minimal Schemas
const PermissionSchema = new mongoose.Schema({
  name: String,
  displayName: String,
  category: String,
});
// Use existing model name to avoid overwriting model compilation error if already compiled
const Permission =
  mongoose.models.Permission || mongoose.model("Permission", PermissionSchema);

const RoleSchema = new mongoose.Schema({
  name: String,
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  sidebarAccess: [String], // Some systems use this for menu visibility
  tenantId: mongoose.Schema.Types.ObjectId,
});
const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);

const TenantSchema = new mongoose.Schema({
  name: String,
  enabledModules: [String],
});
const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);

async function fixAccess() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from environment. Make sure .env file exists.",
      );
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
      log(`✅ Created permission: ${perm._id}`);
    } else {
      log(`✅ Found 'view_panchayats' permission (${perm._id})`);
    }

    // 2. Fix Tenants (Enabled Modules)
    const tenants = await Tenant.find({});
    log(`Checking ${tenants.length} tenants...`);

    for (const t of tenants) {
      let changed = false;
      if (!t.enabledModules) t.enabledModules = [];

      // Fix singular -> plural
      const singularIndex = t.enabledModules.indexOf("panchayat");
      if (singularIndex !== -1) {
        log(
          `- [${t.name}] Fixed singular 'panchayat' to plural in enabledModules`,
        );
        t.enabledModules.splice(singularIndex, 1);
        if (!t.enabledModules.includes("panchayats")) {
          t.enabledModules.push("panchayats");
        }
        changed = true;
      } else if (!t.enabledModules.includes("panchayats")) {
        log(`- [${t.name}] Added 'panchayats' module to enabledModules`);
        t.enabledModules.push("panchayats");
        changed = true;
      }

      if (changed) await t.save();
    }
    log("✅ Tenants validated.");

    // 3. Fix Roles (Permissions & Sidebar)
    const roles = await Role.find({});
    log(`Checking ${roles.length} roles...`);

    // Core admin roles that should have access
    const TARGET_ROLES = ["tenant_admin", "superadmin", "system_admin"];

    for (const r of roles) {
      let changed = false;

      if (TARGET_ROLES.includes(r.name) || r.name.includes("admin")) {
        // A. Add Permission to Role
        if (!r.permissions) r.permissions = [];
        const permIds = r.permissions.map((p) => p.toString());

        if (!permIds.includes(perm._id.toString())) {
          r.permissions.push(perm._id);
          changed = true;
          log(`- [Role: ${r.name}] Added 'view_panchayats' permission`);
        }

        // B. Fix Sidebar Access (if restricting via allowlist)
        if (r.sidebarAccess && Array.isArray(r.sidebarAccess)) {
          const hasWildcard = r.sidebarAccess.includes("*");
          if (!hasWildcard && r.sidebarAccess.length > 0) {
            // Add the path used in menu.ts
            if (!r.sidebarAccess.includes("/panchayat")) {
              r.sidebarAccess.push("/panchayat");
              changed = true;
              log(`- [Role: ${r.name}] Added '/panchayat' to sidebarAccess`);
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
