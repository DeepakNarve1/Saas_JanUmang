const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, "Server", ".env") });

const Tenant = require("./Server/src/models/tenantModel");
const Role = require("./Server/src/models/roleModel");
const Permission = require("./Server/src/models/permissionModel");
const {
  MODULES,
  PLANS,
  getPlanConfig,
  getCoreModuleIds,
} = require("./Server/src/config/modules");

async function syncAll() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const tenants = await Tenant.find({});
    console.log(`Found ${tenants.length} tenants. Starting sync...`);

    for (const tenant of tenants) {
      console.log(`\nSyncing tenant: ${tenant.name} (${tenant.plan})`);

      // 1. Get current plan config
      const planConfig = getPlanConfig(tenant.plan || "basic");

      // 2. Determine modules that SHOULD be enabled
      const coreModules = getCoreModuleIds();
      const planModules = planConfig.enabledModules || [];
      const currentModules = tenant.enabledModules || [];

      // Merge all (keep custom modules if any)
      const targetModules = [
        ...new Set([...coreModules, ...planModules, ...currentModules]),
      ];

      // Update tenant if modules changed
      if (
        JSON.stringify(tenant.enabledModules.sort()) !==
        JSON.stringify(targetModules.sort())
      ) {
        console.log(`Updated enabledModules for ${tenant.name}`);
        tenant.enabledModules = targetModules;
        await tenant.save();
      }

      // 3. Collect ALL permission IDs for these modules
      const allPermIds = [];
      for (const moduleId of targetModules) {
        const moduleConfig = Object.values(MODULES).find(
          (m) => m.id === moduleId,
        );
        if (!moduleConfig) continue;

        const perms = moduleConfig.permissions || [];
        for (const permName of perms) {
          const permDoc = await Permission.findOneAndUpdate(
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
                isActive: true,
              },
            },
            { upsert: true, new: true },
          );
          if (permDoc) allPermIds.push(permDoc._id);
        }
      }

      // 4. Update the organization admin role
      const adminRole = await Role.findOne({
        tenantId: tenant._id,
        $or: [{ name: "tenant_admin" }, { level: "tenant_admin" }],
      });

      if (adminRole) {
        adminRole.permissions = [...new Set(allPermIds)];
        adminRole.modules = targetModules;
        await adminRole.save();
        console.log(
          `Synchronized permissions for Organization Admin of ${tenant.name}`,
        );
      }
    }

    console.log("\nAll tenants synced successfully.");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

syncAll();
