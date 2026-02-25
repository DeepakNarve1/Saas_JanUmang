require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
const User = require("./src/models/userModel");
const Role = require("./src/models/roleModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

async function checkSeashellUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const tenant = await Tenant.findOne({ name: "Seashell Corp" });
    if (!tenant) {
      console.log("Seashell Corp not found");
      process.exit(1);
    }

    console.log(`Tenant: ${tenant.name} (${tenant._id})`);

    const users = await User.find({ tenant: tenant._id }).populate("role");
    console.log(`Found ${users.length} users for Seashell Corp.`);

    for (const user of users) {
      console.log(`\nUser: ${user.email} (${user.name})`);
      console.log(`  Level: ${user.level}`);
      if (user.role) {
        console.log(`  Role: ${user.role.name}`);
        console.log(
          `  Permissions: ${user.role.permissions.slice(0, 10).join(", ")}...`,
        );
      } else {
        console.log("  Role: <No Role Assigned>");
      }
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkSeashellUsers();
