const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Tenant = require("../src/models/tenantModel");
const Role = require("../src/models/roleModel");
const Permission = require("../src/models/permissionModel");
const {
  getCoreModuleIds,
  getPermissionsForModules,
} = require("../src/config/modules");

const MONGO_URI = process.env.MONGO_URI;

const reconcileTenantPermissions = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Reconciling Tenant Permissions...");

    const tenants = await Tenant.find({});
    console.log(`Found ${tenants.length} tenants.`);

    const coreModules = getCoreModuleIds();
    console.log(
      `Common Core Modules (alwaysEnabled): ${coreModules.join(", ")}`,
    );

    for (const tenant of tenants) {
      console.log(`\nProcessing Tenant: ${tenant.name} (${tenant.plan})`);

      // 1. Ensure tenant has core modules in its enabledModules list
      let updatedTenant = false;
      if (!tenant.enabledModules) tenant.enabledModules = [];

      for (const modId of coreModules) {
        if (!tenant.enabledModules.includes(modId)) {
          console.log(`  + Adding core module to tenant: ${modId}`);
          tenant.enabledModules.push(modId);
          updatedTenant = true;
        }
      }

      if (updatedTenant) {
        await tenant.save();
        console.log(`  ✓ Updated enabledModules for ${tenant.name}`);
      }

      // 2. Find the tenant_admin role
      const tenantAdminRole = await Role.findOne({
        tenantId: tenant._id,
        name: "tenant_admin",
        isDeleted: { $ne: true },
      });

      if (!tenantAdminRole) {
        console.log(`  ! No tenant_admin role found for ${tenant.name}`);
        continue;
      }

      // 3. Get expected permissions based on the tenant's enabled modules
      const expectedModulePermissions = await getPermissionsForModules(
        tenant.enabledModules,
      );

      // Need to convert to permission IDs (ObjectIds)
      const permissionDocs = await Permission.find({
        name: { $in: expectedModulePermissions },
        isActive: true,
      });
      const expectedPermissionIds = permissionDocs.map((p) => p._id.toString());

      // 4. Compare with current permissions
      const currentPermissionIds = tenantAdminRole.permissions.map((p) =>
        p.toString(),
      );

      const missingPermissionIds = expectedPermissionIds.filter(
        (id) => !currentPermissionIds.includes(id),
      );

      if (missingPermissionIds.length > 0) {
        console.log(
          `  + Adding ${missingPermissionIds.length} missing permissions to tenant_admin role`,
        );
        tenantAdminRole.permissions = [
          ...new Set([...currentPermissionIds, ...expectedPermissionIds]),
        ];

        // Also update the modules list in the role if it exists
        if (tenantAdminRole.modules) {
          tenantAdminRole.modules = [
            ...new Set([...tenantAdminRole.modules, ...tenant.enabledModules]),
          ];
        } else {
          tenantAdminRole.modules = tenant.enabledModules;
        }

        await tenantAdminRole.save();
        console.log(
          `  ✓ Updated permissions for tenant_admin role of ${tenant.name}`,
        );
      } else {
        console.log(`  - Permissions are already up to date.`);
      }
    }

    const fs = require("fs");
    fs.writeFileSync(
      path.resolve(__dirname, "../../success_reconcile.txt"),
      "Reconciliation completed at " + new Date().toISOString(),
    );
    console.log("\nTenant Permission Reconciliation Completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error reconciling tenant permissions:", error);
    process.exit(1);
  }
};

/**
 * Helper since the one in modules.js works with strings but we need ObjectIds
 */
async function getPermissionsForModulesFromDB(moduleNames) {
  const permissions = await Permission.find({
    module: { $in: moduleNames },
    isActive: true,
  });
  return permissions.map((p) => p._id);
}

reconcileTenantPermissions();
