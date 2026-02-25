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

const fixPanchayatAccessForAll = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    // 1. Ensure Permissions Exist Globally
    const permIds = [];
    console.log("Checking global permissions...");
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

    // 2. Iterate over ALL tenants
    const tenants = await Tenant.find({});
    console.log(`Found ${tenants.length} tenants. Checking roles...`);

    for (const tenant of tenants) {
      // Check if tenant has 'panchayats' module enabled
      if (tenant.enabledModules.includes("panchayats")) {
        // Find 'tenant_admin' role for this tenant
        const role = await Role.findOne({
          tenantId: tenant._id,
          level: "tenant_admin",
        });

        if (role) {
          let changed = false;
          for (const pid of permIds) {
            // Must use .equals() for ObjectIds comparison or string conversion
            const exists = role.permissions.some(
              (p) => p.toString() === pid.toString(),
            );
            if (!exists) {
              role.permissions.push(pid);
              changed = true;
            }
          }
          if (changed) {
            await role.save();
            console.log(
              `✅ Updated 'tenant_admin' role for tenant: ${tenant.name}`,
            );
          } else {
            // console.log(`- 'tenant_admin' role for ${tenant.name} already has permissions.`);
          }
        } else {
          console.warn(
            `⚠️  No 'tenant_admin' role found for tenant: ${tenant.name}`,
          );
        }
      } else {
        // console.log(`- Tenant ${tenant.name} does not have 'panchayats' enabled. Skipping.`);
      }
    }

    // 3. SPECIAL FIX: Force assign to 'Seashell Corp' user if needed (fallback)
    // Since we had issues finding the user in previous steps, let's look by email
    // and force update ANY role they have if they belong to a tenant with panchayats.

    const targetEmail = "seashelladmin@example.com";
    const specialUser = await User.findOne({ email: targetEmail });
    if (specialUser && specialUser.tenantId) {
      const t = await Tenant.findById(specialUser.tenantId);
      if (t && t.enabledModules.includes("panchayats") && specialUser.role) {
        // Use Mongoose Model to update
        const r = await Role.findById(specialUser.role);
        if (r) {
          let c = false;
          for (const pid of permIds) {
            const exists = r.permissions.some(
              (p) => p.toString() === pid.toString(),
            );
            if (!exists) {
              r.permissions.push(pid);
              c = true;
            }
          }
          if (c) {
            await r.save();
            console.log(
              `✅ Forced permission update for user: ${specialUser.email} (Role: ${r.name})`,
            );
          }
        }
      }
    }

    console.log("Done.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

fixPanchayatAccessForAll();
