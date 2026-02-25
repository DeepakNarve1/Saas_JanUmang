/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
const Role = require("./src/models/roleModel");
const Permission = require("./src/models/permissionModel");
const User = require("./src/models/userModel");
const { MODULES } = require("./src/config/modules");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const getPermissionsForModules = async (moduleIds) => {
  const allPermissionIds = [];
  console.log(`Getting permissions for modules: ${moduleIds.join(", ")}`);

  for (const moduleId of moduleIds) {
    const moduleConfig = MODULES[moduleId.toUpperCase()];
    if (!moduleConfig) {
      console.warn(`Warning: Module config not found for ${moduleId}`);
      continue;
    }

    const permissions = moduleConfig.permissions || [];
    for (const permName of permissions) {
      const permissionDoc = await Permission.findOneAndUpdate(
        { name: permName },
        {
          $setOnInsert: {
            name: permName,
            displayName: permName
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            module: moduleId,
            category: permName.split("_")[0] || "other",
            description: `Permission for ${moduleConfig.name}`,
            isActive: true,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      if (permissionDoc) {
        allPermissionIds.push(permissionDoc._id);
      }
    }
  }
  return [...new Set(allPermissionIds.map((id) => id.toString()))];
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const tenant = await Tenant.findOne({ name: "Seashell Corp" });
    if (!tenant) {
      console.log("Seashell Corp not found");
      process.exit(1);
    }
    console.log(`Found tenant: ${tenant.name}`);

    // Find tenant_admin role
    let role = await Role.findOne({
      tenantId: tenant._id,
      level: "tenant_admin",
    });
    if (!role) {
      console.log("Looking for role by name 'tenant_admin'...");
      role = await Role.findOne({ tenantId: tenant._id, name: "tenant_admin" });
    }

    if (!role) {
      console.log(
        "❌ Could not find generic tenant_admin role. Checking specific user...",
      );
      const adminUser = await User.findOne({
        email: "seashelladmin@example.com",
      });
      if (adminUser && adminUser.role) {
        role = await Role.findById(adminUser.role);
      }
    }

    if (!role) {
      console.error("❌ Fatal: No role found to update.");
      process.exit(1);
    }

    console.log(`Found Role to update: ${role.name} (${role._id})`);

    const enabledModules = tenant.enabledModules;
    console.log(`Enabled Modules: ${enabledModules.length}`);

    const newPermIds = await getPermissionsForModules(enabledModules);
    console.log(`Resolved ${newPermIds.length} expected permissions.`);

    role.permissions = newPermIds;
    role.modules = enabledModules;
    await role.save();

    console.log("✅ Role updated successfully with all permissions.");

    setTimeout(() => process.exit(0), 1000);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

run();
