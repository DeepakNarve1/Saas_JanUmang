/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
const Role = require("./src/models/roleModel");
const Permission = require("./src/models/permissionModel");
const User = require("./src/models/userModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const PERMISSIONS = [
  "view_panchayats",
  "manage_panchayats",
  "create_panchayats",
  "edit_panchayats",
  "delete_panchayats",
];

const fixPanchayatAccess = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    // 1. Get Seashell Corp
    const tenant = await Tenant.findOne({ name: "Seashell Corp" });
    if (!tenant) {
      console.error("Seashell Corp not found");
      process.exit(1);
    }

    console.log(`Checking permissions for Tenant: ${tenant.name}`);

    // 2. Ensure Permissions Exist
    const permIds = [];
    for (const pName of PERMISSIONS) {
      let perm = await Permission.findOne({ name: pName });
      if (!perm) {
        console.log(`Creating missing permission: ${pName}`);
        perm = await Permission.create({
          name: pName,
          displayName: pName.replace("_", " ").toUpperCase(),
          module: "panchayats",
          category: pName.split("_")[0],
        });
      }
      permIds.push(perm._id);
    }

    // 3. Update 'tenant_admin' Role for this Tenant
    const role = await Role.findOne({
      tenantId: tenant._id,
      name: "tenant_admin", // Assuming 'tenant_admin' is the role name
    });

    if (!role) {
      console.error(
        "Role 'tenant_admin' not found for Seashell Corp. Creating/Finding default...",
      );
      // Try query by level if name differs
      // Or inspect users to see what role ID they have
    }

    // Get users to find their role
    const users = await User.find({ tenantId: tenant._id });
    if (users.length === 0) {
      console.log("No users found for Seashell Corp.");
    }

    for (const user of users) {
      console.log(`Checking user ${user.email}...`);
      if (user.role && mongoose.Types.ObjectId.isValid(user.role)) {
        const userRole = await Role.findById(user.role);
        if (userRole) {
          console.log(`  Role found: ${userRole.name}`);
          let changed = false;
          for (const pid of permIds) {
            if (!userRole.permissions.includes(pid)) {
              userRole.permissions.push(pid);
              changed = true;
              console.log(
                `  -> Added permission ${pid} to role ${userRole.name}`,
              );
            }
          }
          if (changed) {
            await userRole.save();
            console.log("  ✅ Role updated.");
          } else {
            console.log("  Role already has all panchayat permissions.");
          }
        }
      }
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

fixPanchayatAccess();
