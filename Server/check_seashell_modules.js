require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

async function checkSeashell() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const tenant = await Tenant.findOne({ name: "Seashell Corp" });
    if (!tenant) {
      console.log("Seashell Corp not found");
    } else {
      console.log("Tenant:", tenant.name);
      console.log("Plan:", tenant.plan);
      console.log("Enabled Modules:", tenant.enabledModules);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkSeashell();
