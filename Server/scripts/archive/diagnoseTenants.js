/**
 * Diagnostic Script - Check Tenant and Role Status
 *
 * This script shows you what tenants and roles exist in your database
 * to help diagnose tenant creation issues.
 */

const mongoose = require("mongoose");
const Role = require("./src/models/roleModel");
const Tenant = require("./src/models/tenantModel");
const User = require("./src/models/userModel");
require("dotenv").config();

const diagnose = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all tenants
    const tenants = await Tenant.find({}).lean();
    console.log(`📊 Total Tenants: ${tenants.length}\n`);

    for (const tenant of tenants) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`🏢 Tenant: ${tenant.name} (${tenant.slug})`);
      console.log(`   ID: ${tenant._id}`);
      console.log(`   Plan: ${tenant.plan}`);
      console.log(`   Max Users: ${tenant.maxUsers}`);
      console.log(`   Max Storage: ${tenant.maxStorage} MB`);
      console.log(`   Enabled Modules: ${tenant.enabledModules.length}`);

      // Find roles for this tenant
      const roles = await Role.find({
        tenantId: tenant._id,
        isDeleted: { $ne: true },
      }).lean();

      console.log(`\n   👥 Roles (${roles.length}):`);
      for (const role of roles) {
        console.log(`      - ${role.displayName} (${role.name})`);
        console.log(`        ID: ${role._id}`);
        console.log(`        Level: ${role.level}`);
        console.log(`        Permissions: ${role.permissions.length}`);
      }

      // Find users for this tenant
      const users = await User.find({
        tenantId: tenant._id,
      })
        .select("name email level")
        .lean();

      console.log(`\n   👤 Users (${users.length}):`);
      for (const user of users) {
        console.log(`      - ${user.name} (${user.email})`);
        console.log(`        Level: ${user.level}`);
      }
    }

    // Check for orphaned tenant_admin roles
    console.log(`\n${"=".repeat(60)}`);
    console.log("\n🔍 Checking for orphaned tenant_admin roles...\n");

    const allTenantAdminRoles = await Role.find({
      name: "tenant_admin",
      isDeleted: { $ne: true },
    }).lean();

    console.log(`   Found ${allTenantAdminRoles.length} tenant_admin roles`);

    for (const role of allTenantAdminRoles) {
      const tenant = await Tenant.findById(role.tenantId);
      if (!tenant) {
        console.log(
          `   ❌ ORPHANED: Role ${role._id} has no tenant (tenantId: ${role.tenantId})`,
        );
      } else {
        console.log(`   ✅ Valid: Role ${role._id} belongs to ${tenant.name}`);
      }
    }

    // Check for duplicate tenant_admin roles
    console.log("\n🔍 Checking for duplicate tenant_admin roles...\n");

    const tenantIdCounts = {};
    for (const role of allTenantAdminRoles) {
      const tenantIdStr = role.tenantId.toString();
      tenantIdCounts[tenantIdStr] = (tenantIdCounts[tenantIdStr] || 0) + 1;
    }

    const duplicates = Object.entries(tenantIdCounts).filter(
      ([_, count]) => count > 1,
    );
    if (duplicates.length > 0) {
      console.log(
        `   ❌ Found ${duplicates.length} tenants with duplicate tenant_admin roles:`,
      );
      for (const [tenantId, count] of duplicates) {
        const tenant = await Tenant.findById(tenantId);
        console.log(
          `      - ${tenant?.name || "Unknown"} (${tenantId}): ${count} roles`,
        );
      }
    } else {
      console.log("   ✅ No duplicate tenant_admin roles found");
    }

    console.log("\n✅ Diagnosis completed!");
    console.log("\n💡 If you found orphaned or duplicate roles, run:");
    console.log("   node cleanupTenantRoles.js\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during diagnosis:", error);
    process.exit(1);
  }
};

// Run the diagnosis
diagnose();
