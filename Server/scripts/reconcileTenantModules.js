const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Tenant = require("../src/models/tenantModel");
const { PLANS, getPlanConfig } = require("../src/config/modules");

const MONGO_URI = process.env.MONGO_URI;

const reconcileTenantModules = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Reconciling Tenant Modules...");

    const tenants = await Tenant.find({});
    console.log(`Found ${tenants.length} tenants.`);

    for (const tenant of tenants) {
      console.log(`Processing Tenant: ${tenant.name} (${tenant.plan})`);

      const planConfig = getPlanConfig(tenant.plan || "basic");
      const defaultModules = planConfig.enabledModules || [];

      let updated = false;

      // Ensure existing enabledModules is initialized
      if (!tenant.enabledModules) {
        tenant.enabledModules = [];
      }

      // Add missing modules from the plan
      for (const modId of defaultModules) {
        if (!tenant.enabledModules.includes(modId)) {
          console.log(`  + Adding missing module: ${modId}`);
          tenant.enabledModules.push(modId);
          updated = true;
        }
      }

      // Special handling for Enterprise (all modules) if implemented differently,
      // but getPlanConfig handles defaults.
      // If plan is custom, we might skip or warn.

      if (updated) {
        await tenant.save();
        console.log(`  ✓ Updated modules for ${tenant.name}`);
      } else {
        console.log(`  - No changes needed.`);
      }
    }

    console.log("Tenant Module Reconciliation Completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error reconciling tenant modules:", error);
    process.exit(1);
  }
};

reconcileTenantModules();
