require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
const User = require("./src/models/userModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

async function findOrphanedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    // 1. Get all tenants map (name -> id)
    const tenants = await Tenant.find({});
    const tenantMap = {};
    tenants.forEach((t) => {
      tenantMap[t._id.toString()] = t.name;
    });

    console.log(`Tenants found: ${Object.keys(tenantMap).length}`);
    for (const [id, name] of Object.entries(tenantMap)) {
      console.log(` - ${name} (${id})`);
    }

    // 2. Scan all users
    const users = await User.find({});
    console.log(`\nTotal Users: ${users.length}`);

    let problemUsers = 0;
    for (const user of users) {
      let tid = user.tenantId ? user.tenantId.toString() : null;
      let tenantName = tid ? tenantMap[tid] : "NULL/UNDEFINED";

      if (tid && !tenantMap[tid]) {
        console.log(
          `⚠️  User ${user.email} (${user.name}) has INVALID/DELETED tenantId: ${tid}`,
        );
        problemUsers++;
      } else if (!tid) {
        console.log(`⚠️  User ${user.email} (${user.name}) has NO tenantId.`);
        // Debug: check if 'tenant' field exists instead
        if (user._doc.tenant) {
          console.log(
            `    -> BUT found old 'tenant' field: ${user._doc.tenant}`,
          );
        }
        problemUsers++;
      } else {
        // Valid tenant
        // console.log(`✅ User ${user.email} belongs to ${tenantName}`);
      }
    }

    console.log(`\nFound ${problemUsers} users with tenant issues.`);

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

findOrphanedUsers();
