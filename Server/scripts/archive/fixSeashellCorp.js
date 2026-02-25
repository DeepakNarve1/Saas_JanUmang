/**
 * Fix Seashell-Corp Tenant - Create Missing Role and Admin User
 *
 * This script creates the missing tenant_admin role and admin user
 * for the Seashell-Corp tenant.
 */

const mongoose = require("mongoose");
const Role = require("./src/models/roleModel");
const Tenant = require("./src/models/tenantModel");
const User = require("./src/models/userModel");
const Permission = require("./src/models/permissionModel");
require("dotenv").config();

const fixSeashellCorp = async () => {
  try {
    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find Seashell-Corp tenant
    const tenant = await Tenant.findOne({ slug: "seashell-corp" });

    if (!tenant) {
      console.log("❌ Seashell-Corp tenant not found!");
      process.exit(1);
    }

    console.log(`✅ Found tenant: ${tenant.name} (${tenant._id})\n`);

    // Step 1: Remove orphaned roles
    console.log("🧹 Step 1: Cleaning up orphaned roles...");
    const orphanedRoles = await Role.find({
      name: "tenant_admin",
      tenantId: { $ne: tenant._id },
    });

    for (const role of orphanedRoles) {
      const roleExists = await Tenant.findById(role.tenantId);
      if (!roleExists) {
        console.log(`   Removing orphaned role: ${role._id}`);
        await Role.findByIdAndDelete(role._id);
      }
    }
    console.log("✅ Cleanup completed\n");

    // Step 2: Check if tenant_admin role exists for this tenant
    console.log("🔍 Step 2: Checking for tenant_admin role...");
    let tenantAdminRole = await Role.findOne({
      name: "tenant_admin",
      tenantId: tenant._id,
      isDeleted: { $ne: true },
    });

    if (tenantAdminRole) {
      console.log(
        `✅ tenant_admin role already exists: ${tenantAdminRole._id}\n`,
      );
    } else {
      console.log("   Creating tenant_admin role...");

      // Get all permissions for enabled modules
      const permissions = await Permission.find({
        module: { $in: tenant.enabledModules },
        isActive: true,
      });

      tenantAdminRole = await Role.create({
        name: "tenant_admin",
        displayName: "Organization Admin",
        description: "Full access to all enabled modules in the organization",
        tenantId: tenant._id,
        level: "tenant_admin",
        permissions: permissions.map((p) => p._id),
        modules: tenant.enabledModules,
        isSystem: false,
        isDefault: true,
      });

      console.log(`✅ Created tenant_admin role: ${tenantAdminRole._id}\n`);
    }

    // Step 3: Check if admin user exists
    console.log("🔍 Step 3: Checking for admin user...");
    const adminUser = await User.findOne({
      tenantId: tenant._id,
      level: "tenant_admin",
    });

    if (adminUser) {
      console.log(`✅ Admin user already exists: ${adminUser.email}\n`);
    } else {
      console.log("❌ No admin user found for this tenant\n");
      console.log("💡 You need to create an admin user manually via:");
      console.log("   POST /api/tenants/:id/admins");
      console.log("   OR update the tenant owner field\n");
    }

    // Step 4: Summary
    console.log("📊 Summary:");
    console.log(`   Tenant: ${tenant.name}`);
    console.log(`   Tenant ID: ${tenant._id}`);
    console.log(`   Plan: ${tenant.plan}`);
    console.log(`   Max Users: ${tenant.maxUsers}`);
    console.log(`   Max Storage: ${tenant.maxStorage} MB`);
    console.log(`   Enabled Modules: ${tenant.enabledModules.length}`);
    console.log(
      `   tenant_admin Role: ${tenantAdminRole ? "✅ Exists" : "❌ Missing"}`,
    );
    console.log(`   Admin User: ${adminUser ? "✅ Exists" : "❌ Missing"}`);

    console.log("\n✅ Fix completed!");

    if (!adminUser) {
      console.log("\n⚠️  Next Step: Create admin user");
      console.log("   You can do this via the API or frontend");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

// Run the fix
fixSeashellCorp();
