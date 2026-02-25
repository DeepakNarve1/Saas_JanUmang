/**
 * Seed Permissions for All Modules
 *
 * This script creates all permissions for the modules defined in the module registry.
 * Run this script once to populate the permissions collection.
 *
 * Usage: node Server/scripts/seedPermissions.js
 */

const mongoose = require("mongoose");
const Permission = require("../src/models/permissionModel");
const { MODULES, getAllModules } = require("../src/config/modules");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/janumang",
    );
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Helper function to create permission display name
const createDisplayName = (permissionName) => {
  return permissionName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to determine permission category
const getPermissionCategory = (permissionName) => {
  if (permissionName.includes("view") || permissionName.includes("list")) {
    return "view";
  } else if (
    permissionName.includes("create") ||
    permissionName.includes("add")
  ) {
    return "create";
  } else if (
    permissionName.includes("edit") ||
    permissionName.includes("update")
  ) {
    return "edit";
  } else if (
    permissionName.includes("delete") ||
    permissionName.includes("remove")
  ) {
    return "delete";
  } else if (permissionName.includes("export")) {
    return "export";
  } else if (permissionName.includes("manage")) {
    return "manage";
  } else {
    return "other";
  }
};

// Main seed function
const seedPermissions = async () => {
  try {
    console.log("\n🌱 Starting permission seeding...\n");

    // Get all modules
    const modules = getAllModules();
    console.log(`📦 Found ${modules.length} modules\n`);

    let totalCreated = 0;
    let totalSkipped = 0;
    let totalUpdated = 0;

    // Process each module
    for (const module of modules) {
      console.log(`\n📂 Processing module: ${module.name} (${module.id})`);
      console.log(`   Permissions to create: ${module.permissions.length}`);

      for (const permissionName of module.permissions) {
        try {
          // Check if permission already exists
          const existingPermission = await Permission.findOne({
            name: permissionName,
          });

          if (existingPermission) {
            // Update if module field is missing
            if (!existingPermission.module) {
              existingPermission.module = module.id;
              existingPermission.category =
                getPermissionCategory(permissionName);
              existingPermission.isActive = true;
              await existingPermission.save();
              console.log(`   ✏️  Updated: ${permissionName}`);
              totalUpdated++;
            } else {
              console.log(`   ⏭️  Skipped: ${permissionName} (already exists)`);
              totalSkipped++;
            }
          } else {
            // Create new permission
            const permission = await Permission.create({
              name: permissionName,
              displayName: createDisplayName(permissionName),
              description: `Permission to ${permissionName.replace(/_/g, " ")}`,
              module: module.id,
              category: getPermissionCategory(permissionName),
              isActive: true,
            });
            console.log(`   ✅ Created: ${permissionName}`);
            totalCreated++;
          }
        } catch (error) {
          console.error(
            `   ❌ Error processing ${permissionName}:`,
            error.message,
          );
        }
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Seeding Summary:");
    console.log("=".repeat(60));
    console.log(`✅ Created:  ${totalCreated} permissions`);
    console.log(`✏️  Updated:  ${totalUpdated} permissions`);
    console.log(`⏭️  Skipped:  ${totalSkipped} permissions`);
    console.log(
      `📦 Total:    ${totalCreated + totalUpdated + totalSkipped} permissions`,
    );
    console.log("=".repeat(60) + "\n");

    // Show permissions by module
    console.log("\n📋 Permissions by Module:\n");
    for (const module of modules) {
      const count = await Permission.countDocuments({ module: module.id });
      console.log(`   ${module.name.padEnd(30)} ${count} permissions`);
    }

    console.log("\n✅ Permission seeding completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Error seeding permissions:", error);
    throw error;
  }
};

// Run the script
const run = async () => {
  try {
    await connectDB();
    await seedPermissions();
    console.log("✅ All done! Exiting...\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
};

// Execute
run();
