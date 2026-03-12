require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const tenants = await Tenant.find({ plan: "basic" });
  console.log("Basic Tenants Enabled Modules:");
  tenants.forEach((t) => {
    console.log(`${t.name}: ${JSON.stringify(t.enabledModules)}`);
  });
  await mongoose.disconnect();
})();
