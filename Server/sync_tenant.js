const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Tenant = require("./src/models/tenantModel");
  const { getPlanConfig } = require("./src/config/modules");

  const tenants = await Tenant.find({});
  for (const tenant of tenants) {
    if (
      tenant.plan &&
      tenant.plan !== "custom" &&
      tenant.plan !== "enterprise"
    ) {
      const modulePlanConfig = getPlanConfig(tenant.plan);
      tenant.enabledModules = Array.from(
        new Set(modulePlanConfig.enabledModules || []),
      );
      await tenant.save();
      console.log(
        `Reset ${tenant.name} to exact ${tenant.plan} modules (${tenant.enabledModules.length} found).`,
      );
    } else {
      console.log(`Skipped ${tenant.name} (Plan: ${tenant.plan})`);
    }
  }
  process.exit(0);
});
