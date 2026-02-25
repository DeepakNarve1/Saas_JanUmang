const mongoose = require("mongoose");
require("dotenv").config();

async function checkRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const Role = require("./src/models/roleModel");
    const roles = await Role.find({ name: /developer/i });
    console.log("--- ROLES FOUND ---");
    console.log(JSON.stringify(roles, null, 2));
    console.log("--- END ROLES ---");

    // Check for organizations
    const Tenant = require("./src/models/tenantModel");
    const tenants = await Tenant.find({}, "name slug _id");
    console.log("--- TENANTS ---");
    console.log(JSON.stringify(tenants, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRoles();
