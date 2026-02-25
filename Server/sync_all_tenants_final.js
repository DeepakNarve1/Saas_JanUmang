const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const Tenant = require("./src/models/tenantModel");
const Role = require("./src/models/roleModel");
const Permission = require("./src/models/permissionModel");
const { getPermissionsForModules } = require("./src/config/modules");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/janumang";

const syncAllTenants = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const tenants = await Tenant.find({});
    console.log(`🔍 Found ${tenants.length} tenants`);

    for (const tenant of tenants) {
      console.log(
        `\n🏢 Syncing tenant: ${tenant.name} (${tenant.organizationId})`,
      );

      const enabledModules = tenant.enabledModules || [];
      if (enabledModules.length === 0) {
        console.log(`   ⚠️ No modules enabled. Skipping.`);
        continue;
      }

      // Get all potential permission IDs for currently enabled modules
      // This helper (from config/modules.js) might need to be adjusted if it doesn't
      // handle dynamic creation.
      // Actually, I'll use a local version that's robust.

      const getRobustPermissions = async (moduleIds) => {
        const permissions = [];
        const { MODULES } = require("./src/config/modules");

        const allPermNames = [];
        moduleIds.forEach((modId) => {
          const modKey = Object.keys(MODULES).find(
            (k) => MODULES[k].id === modId,
          );
          if (modKey && MODULES[modKey].permissions) {
            allPermNames.push(...MODULES[modKey].permissions);
          }
        });

        for (const name of [...new Set(allPermNames)]) {
          // Find or create permission
          const perm = await Permission.findOneAndUpdate(
            { name },
            {
              $setOnInsert: {
                displayName: name
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" "),
                module: moduleIds.find((m) => name.includes(m)) || "system",
                isActive: true,
              },
            },
            { upsert: true, new: true },
          );
          permissions.push(perm._id);
        }
        return permissions;
      };

      const expectedPermissionIds = await getRobustPermissions(enabledModules);
      console.log(
        `   ✅ Target permissions count: ${expectedPermissionIds.length}`,
      );

      // Update tenant_admin role
      const adminRole = await Role.findOne({
        tenantId: tenant._id,
        name: "tenant_admin",
      });

      if (adminRole) {
        adminRole.permissions = expectedPermissionIds;
        await adminRole.save();
        console.log(`   ✅ Updated tenant_admin role`);
      } else {
        console.log(`   ⚠️ tenant_admin role not found for this tenant`);
      }
    }

    console.log("\n✅ All tenants synced successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Sync failed:", error);
    process.exit(1);
  }
};

syncAllTenants();
