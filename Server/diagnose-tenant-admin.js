/**
 * diagnose-tenant-admin.js
 *
 * Run this from the Server directory to find any users
 * who have level=tenant_admin but are missing a tenantId.
 *
 * Usage:
 *   node src/scripts/diagnose-tenant-admin.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/userModel");
const Tenant = require("./src/models/tenantModel");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB\n");

  // Find all users with no tenantId
  const broken = await User.find({
    tenantId: { $exists: false },
    level: { $nin: ["system_admin", "superadmin"] },
  }).select("name email level tenantId");

  if (broken.length === 0) {
    console.log(
      "✅ All non-global-admin users have a tenantId. Bug is elsewhere.",
    );
  } else {
    console.log(`❌ Found ${broken.length} user(s) missing tenantId:\n`);
    broken.forEach((u) =>
      console.log(
        `  - ${u.name} (${u.email}) | level: ${u.level} | _id: ${u._id}`,
      ),
    );
    console.log(
      "\nTo fix, update each user's tenantId field to their correct organisation ObjectId.",
    );
  }

  // Also list all tenants for reference
  const tenants = await Tenant.find().select("name _id status");
  console.log("\n📋 All Tenants:");
  tenants.forEach((t) =>
    console.log(`  - ${t.name} | _id: ${t._id} | status: ${t.status}`),
  );

  await mongoose.disconnect();
})();
