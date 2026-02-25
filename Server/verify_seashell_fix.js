/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
const Role = require("./src/models/roleModel");
const Permission = require("./src/models/permissionModel");
const User = require("./src/models/userModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const verifySeashellPermissions = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const tenant = await Tenant.findOne({ name: "Seashell Corp" });
    if (!tenant) {
      console.log("Seashell Corp not found");
      process.exit(0);
    }

    console.log(`Tenant: ${tenant.name} (${tenant._id})`);

    // Find the admin user
    const adminUser = await User.findOne({
      tenantId: tenant._id,
      email: "seashelladmin@example.com",
    });

    if (!adminUser) {
      console.log("Admin user 'seashelladmin@example.com' not found.");
    } else {
      console.log(`User: ${adminUser.email}`);
      console.log(`Role ID: ${adminUser.role}`);

      const role = await Role.findById(adminUser.role).populate("permissions");
      if (!role) {
        console.log("Role not found!");
      } else {
        console.log(`Role Name: ${role.name}`);
        console.log(`Total Permissions: ${role.permissions.length}`);

        const panchayatPerms = role.permissions.filter(
          (p) => p.module === "panchayats",
        );
        console.log(
          "Panchayat Permissions:",
          panchayatPerms.map((p) => p.name),
        );

        if (panchayatPerms.length === 0) {
          console.log("❌ NO PANCHAYAT PERMISSIONS FOUND!");
        } else {
          console.log("✅ Panchayat permissions present.");
        }
      }
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

verifySeashellPermissions();
