const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const Tenant = require("./src/models/tenantModel");
const Role = require("./src/models/roleModel");
const Permission = require("./src/models/permissionModel");
const { MODULES } = require("./src/config/modules");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/janumang";

const syncAllTenants = async () => {
  try {
    console.log("Connecting to:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const tenants = await Tenant.find({});
    console.log(`🔍 Found ${tenants.length} tenants`);

    for (const tenant of tenants) {
      console.log(
        `\n🏢 Processing tenant: ${tenant.name} (${tenant.organizationId})`,
      );

      const enabledModules = tenant.enabledModules || [];
      console.log(`   Modules enabled: ${enabledModules.join(", ")}`);

      if (enabledModules.length === 0) {
        console.log(`   ⚠️ No modules enabled. Skipping.`);
        continue;
      }

      const allPermNames = [];
      enabledModules.forEach((modId) => {
        // Find module in config (case insensitive)
        const modKey = Object.keys(MODULES).find(
          (k) => MODULES[k].id.toLowerCase() === modId.toLowerCase(),
        );
        if (modKey && MODULES[modKey].permissions) {
          allPermNames.push(...MODULES[modKey].permissions);
        }
      });

      const uniquePermNames = [...new Set(allPermNames)];
      console.log(`   Target permissions: ${uniquePermNames.length}`);

      const permissionIds = [];
      for (const name of uniquePermNames) {
        let perm = await Permission.findOne({ name });
        if (!perm) {
          perm = await Permission.create({
            name,
            displayName: name
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            module: enabledModules.find((m) => name.includes(m)) || "system",
            isActive: true,
          });
          console.log(`     + Created permission: ${name}`);
        }
        permissionIds.push(perm._id);
      }

      // Update tenant_admin role
      // Note: Role model uses tenantId
      const adminRole = await Role.findOne({
        tenantId: tenant._id,
        name: "tenant_admin",
      });

      if (adminRole) {
        adminRole.permissions = permissionIds;
        // Also update the 'modules' field in Role if it exists
        adminRole.modules = enabledModules;
        await adminRole.save();
        console.log(
          `   ✅ Updated tenant_admin role permissions (${permissionIds.length})`,
        );
      } else {
        console.log(
          `   ⚠️ tenant_admin role not found for this tenant. Creating one?`,
        );
        // Maybe create it if it's missing?
        const newAdminRole = await Role.create({
          name: "tenant_admin",
          displayName: "Tenant Administrator",
          tenantId: tenant._id,
          level: "tenant_admin",
          permissions: permissionIds,
          modules: enabledModules,
          isSystem: true,
        });
        console.log(`   ✅ Created missing tenant_admin role`);
      }
    }

    console.log("\n✅ Sync complete!");
    fs.writeFileSync(path.resolve(__dirname, "SYNC_DONE.txt"), "COMPLETE");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during sync:", error);
    process.exit(1);
  }
};

syncAllTenants();
