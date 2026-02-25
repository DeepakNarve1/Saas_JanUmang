/**
 * Status Fix Script - Backfill Missing Status
 *
 * Existing tenants might not have the 'status' field set, causing issues in analytics.
 * This script sets 'status' based on 'subscriptionStatus' or defaults to 'active'.
 */

const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
require("dotenv").config();

const fixTenantStatus = async () => {
  try {
    console.log("🔧 Tenant Status Fix Script");
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected\n");

    const tenants = await Tenant.find({});
    console.log(`Found ${tenants.length} tenants.`);

    let updated = 0;

    for (const tenant of tenants) {
      if (!tenant.status) {
        let newStatus = "active";

        // Infer status from subscriptionStatus if available
        if (tenant.subscriptionStatus === "trial") {
          newStatus = "trialing";
        } else if (tenant.subscriptionStatus === "suspended") {
          newStatus = "suspended";
        } else if (tenant.subscriptionStatus === "cancelled") {
          newStatus = "inactive";
        } else if (!tenant.isActive) {
          newStatus = "inactive";
        }

        console.log(
          `📝 Updating tenant "${tenant.name}" status to "${newStatus}"`,
        );
        tenant.status = newStatus;
        await tenant.save();
        updated++;
      } else {
        console.log(
          `✅ Tenant "${tenant.name}" already has status "${tenant.status}"`,
        );
      }
    }

    console.log(`\n🎉 Updated ${updated} tenants.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

fixTenantStatus();
