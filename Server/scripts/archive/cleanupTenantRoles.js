/**
 * Database Cleanup Script - Remove Orphaned Tenant Admin Roles
 *
 * This script cleans up tenant_admin roles that exist without corresponding tenants
 * or duplicate tenant_admin roles for the same tenant.
 *
 * Run this script if you're getting "tenant_admin already exists" errors
 */

const mongoose = require("mongoose");
const Role = require("./src/models/roleModel");
const Tenant = require("./src/models/tenantModel");
require("dotenv").config();

const cleanupOrphanedRoles = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all tenant_admin roles
    const tenantAdminRoles = await Role.find({
      name: "tenant_admin",
      isDeleted: { $ne: true },
    }).lean();

    console.log(`📊 Found ${tenantAdminRoles.length} tenant_admin roles\n`);

    let orphanedCount = 0;
    let duplicateCount = 0;
    const seenTenants = new Set();

    for (const role of tenantAdminRoles) {
      // Check if tenant exists
      const tenant = await Tenant.findById(role.tenantId);

      if (!tenant) {
        console.log(
          `❌ Orphaned role found: ${role._id} (tenant ${role.tenantId} doesn't exist)`,
        );
        await Role.findByIdAndDelete(role._id);
        orphanedCount++;
      } else if (seenTenants.has(role.tenantId.toString())) {
        console.log(
          `❌ Duplicate role found: ${role._id} for tenant ${tenant.name}`,
        );
        await Role.findByIdAndDelete(role._id);
        duplicateCount++;
      } else {
        console.log(`✅ Valid role: ${role._id} for tenant ${tenant.name}`);
        seenTenants.add(role.tenantId.toString());
      }
    }

    console.log("\n📈 Cleanup Summary:");
    console.log(`   - Orphaned roles removed: ${orphanedCount}`);
    console.log(`   - Duplicate roles removed: ${duplicateCount}`);
    console.log(`   - Valid roles kept: ${seenTenants.size}`);

    console.log("\n✅ Cleanup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
};

// Run the cleanup
cleanupOrphanedRoles();
