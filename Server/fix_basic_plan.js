require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
const Role = require("./src/models/roleModel");
const { getPlanConfig } = require("./src/config/modules");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    const basicPlan = getPlanConfig("basic");
    console.log("Basic plan should have modules:", basicPlan.enabledModules);

    const tenants = await Tenant.find({ plan: "basic" });
    for (const tenant of tenants) {
      console.log(`Processing tenant: ${tenant.name} (${tenant.plan})`);

      // Force reset enabledModules to match the latest config
      tenant.enabledModules = basicPlan.enabledModules;
      await tenant.save();
      console.log(`  - Updated tenant.enabledModules`);

      // Also update the tenant_admin role permissions
      const roles = await Role.find({
        tenantId: tenant._id,
        name: "tenant_admin",
      });
      for (const role of roles) {
        role.modules = basicPlan.enabledModules;
        // Note: role.permissions usually get synced by the controller,
        // but setting modules here is the quickest path for frontend hasPermission.
        await role.save();
        console.log(`  - Updated tenant_admin role: ${role._id}`);
      }
    }

    console.log("Fix complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
