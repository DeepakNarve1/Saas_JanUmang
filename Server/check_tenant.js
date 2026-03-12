const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "d:/Akalp/Saas/JanUmangSaas/Server/.env" });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Tenant = require("./src/models/tenantModel");
    const tenant = await Tenant.findOne();
    console.log("Tenant Name:", tenant.name);
    console.log("Tenant Plan:", tenant.plan);
    console.log(
      "Tenant Enabled Modules (length):",
      tenant.enabledModules.length,
    );
    console.log("Modules:", tenant.enabledModules);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
