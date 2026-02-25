require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

async function compareTenants() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const tenants = await Tenant.find({});
    console.log(`Found ${tenants.length} tenants.`);

    for (const tenant of tenants) {
      console.log(`\nTenant: ${tenant.name} (${tenant.plan} plan)`);
      console.log(`Enabled Modules (${tenant.enabledModules.length}):`);
      console.log(tenant.enabledModules.join(", "));
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

compareTenants();
