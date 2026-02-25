const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
require("dotenv").config();

const checkStatus = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected");

    const tenants = await Tenant.find(
      {},
      "name slug status isActive subscriptionStatus",
    );
    console.log(`Found ${tenants.length} tenants:\n`);

    tenants.forEach((t) => {
      console.log(
        `- ${t.name}: status="${t.status}" (isActive=${t.isActive}, sub=${t.subscriptionStatus})`,
      );
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkStatus();
