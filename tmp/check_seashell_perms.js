const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, "Server", ".env") });

const Tenant = require("./Server/src/models/tenantModel");
const User = require("./Server/src/models/userModel");
const Role = require("./Server/src/models/roleModel");
const Permission = require("./Server/src/models/permissionModel");

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // 1. Find Seashell Tenant
    const tenant = await Tenant.findOne({ name: /seashell/i });
    if (!tenant) {
      console.log("Seashell tenant not found");
      return;
    }
    console.log(`Found Tenant: ${tenant.name} (${tenant._id})`);
    console.log(`Enabled Modules: ${tenant.enabledModules.join(", ")}`);

    // 2. Find Roles for this tenant
    const roles = await Role.find({ tenantId: tenant._id }).populate(
      "permissions",
    );
    console.log(`\nFound ${roles.length} roles:`);

    for (const role of roles) {
      console.log(`- Role: ${role.displayName} (${role.name})`);
      const permNames = role.permissions.map((p) => p.name);
      const hasSubWork = permNames.some((p) => p.includes("sub_work"));
      console.log(`  Has sub_work permissions: ${hasSubWork ? "YES" : "NO"}`);
      if (hasSubWork) {
        console.log(
          `  Perms: ${permNames.filter((p) => p.includes("sub_work")).join(", ")}`,
        );
      }
    }

    // 3. Check if sub_work permissions exist at all
    const allSubWorkPerms = await Permission.find({ name: /sub_work/i });
    console.log(
      `\nSystem wide sub_work permissions found: ${allSubWorkPerms.map((p) => p.name).join(", ")}`,
    );
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

check();
