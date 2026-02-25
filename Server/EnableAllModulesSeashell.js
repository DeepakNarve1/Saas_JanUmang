/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const ALL_MODULES = [
  "dashboard",
  "users",
  "roles",
  "sidebar_permissions",
  "user_count",
  "members",
  "mp_public_problems",
  "assembly_issues",
  "projects",
  "vidhan_sabha_samiti",
  "ganesh_samiti",
  "tenkar_samiti",
  "dp_samiti",
  "mandir_samiti",
  "bhagoria_samiti",
  "nirman_samiti",
  "booth_samiti",
  "block_samiti",
  "visitors",
  "events",
  "voters",
  "samiti",
  "districts",
  "assemblies", // In menu standard plural
  "blocks",
  "booths",
  "panchayats",
  "villages",
  "parties",
  "departments",
  "work_types",
  "sub_work_types",
  "states",
  "divisions",
  "parliaments",
  "phone_directory",
  "in_docs",
  "inward_register",
  "dispatch_register",
  "call_management",
  "activity_management",
  "activity_logs",
  "user_activity_report",
];

const updateSeashellModules = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Updating Seashell Modules...");

    const tenant = await Tenant.findOne({ name: "Seashell Corp" });
    if (!tenant) {
      console.warn("Seashell Corp tenant not found.");
      process.exit(1);
    }

    console.log(
      `Before Update: ${tenant.enabledModules.length} modules enabled.`,
    );

    // Add any missing modules
    let addedCount = 0;
    ALL_MODULES.forEach((mod) => {
      if (!tenant.enabledModules.includes(mod)) {
        tenant.enabledModules.push(mod);
        addedCount++;
        console.log(`  + Added: ${mod}`);
      }
    });

    if (addedCount > 0) {
      await tenant.save();
      console.log(`✅ Added ${addedCount} missing modules to Seashell Corp.`);
      console.log(`Total Enabled Modules: ${tenant.enabledModules.length}`);
    } else {
      console.log("✅ Seashell Corp already has all listed modules enabled.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error updating tenant modules:", error);
    process.exit(1);
  }
};

updateSeashellModules();
