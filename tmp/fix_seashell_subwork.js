const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env
dotenv.config({ path: path.join(__dirname, "Server", ".env") });

const Tenant = require("./Server/src/models/tenantModel");
const Role = require("./Server/src/models/roleModel");
const Permission = require("./Server/src/models/permissionModel");
const { MODULES } = require("./Server/src/config/modules");

async function fix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    // 1. Find Seashell Tenant
    const tenant = await Tenant.findOne({ name: /seashell/i });
    if (!tenant) {
      console.log("Seashell tenant not found");
      return;
    }
    console.log(`Fixing Tenant: ${tenant.name} (${tenant._id})`);

    // 2. Ensure sub_work_types is in enabledModules
    if (!tenant.enabledModules.includes("sub_work_types")) {
      console.log("Adding sub_work_types to enabledModules...");
      tenant.enabledModules.push("sub_work_types");
      await tenant.save();
    }

    // 3. Get all permissions for sub_work_types
    const subWorkConfig = MODULES.SUB_WORK_TYPES;
    const subWorkPermNames = subWorkConfig.permissions;
    const subWorkPermIds = [];

    for (const permName of subWorkPermNames) {
      const perm = await Permission.findOneAndUpdate(
        { name: permName },
        {
          $setOnInsert: {
            name: permName,
            displayName: permName
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
            module: "sub_work_types",
            category: permName.split("_")[0] || "other",
            isActive: true,
          },
        },
        { upsert: true, new: true },
      );
      subWorkPermIds.push(perm._id);
    }
    console.log(`Found/Created ${subWorkPermIds.length} sub_work permissions`);

    // 4. Update the organization admin role
    const adminRole = await Role.findOne({
      tenantId: tenant._id,
      $or: [{ name: "tenant_admin" }, { level: "tenant_admin" }],
    });

    if (adminRole) {
      console.log(`Updating role: ${adminRole.displayName}`);

      // Add permissions if not already there
      const currentPerms = adminRole.permissions.map((p) => p.toString());
      let addedCount = 0;

      for (const pid of subWorkPermIds) {
        if (!currentPerms.includes(pid.toString())) {
          adminRole.permissions.push(pid);
          addedCount++;
        }
      }

      // Ensure sub_work_types is in roles's modules list
      if (!adminRole.modules.includes("sub_work_types")) {
        adminRole.modules.push("sub_work_types");
      }

      await adminRole.save();
      console.log(`Added ${addedCount} permissions to role.`);
    } else {
      console.log("Admin role not found for tenant");
    }

    console.log("Done.");
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

fix();
