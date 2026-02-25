require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
const User = require("./src/models/userModel");
const Role = require("./src/models/roleModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

async function checkSeashellUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const tenant = await Tenant.findOne({ name: "Seashell Corp" });
    if (!tenant) {
      console.log("Seashell Corp not found");
      process.exit(1);
    }
    console.log(`Tenant: ${tenant.name} (${tenant._id})`);

    // Use tenantId, not tenant
    const users = await User.find({ tenantId: tenant._id });
    console.log(`Found ${users.length} users for Seashell Corp.`);

    for (const user of users) {
      console.log(`\nUser: ${user.email} (${user.name})`);
      console.log(`  Level: ${user.level}`);
      console.log(`  Role (Raw):`, user.role);

      if (user.role && mongoose.Types.ObjectId.isValid(user.role)) {
        const roleDoc = await Role.findById(user.role);
        if (roleDoc) {
          console.log(`  Role Name: ${roleDoc.name}`);
          console.log(
            `  Permissions: ${(roleDoc.permissions || []).slice(0, 10).join(", ")} ${(roleDoc.permissions || []).length > 10 ? "..." : ""}`,
          );
        } else {
          console.log("  Role Doc not found for ID:", user.role);
        }
      } else {
        console.log("  Role is not an ObjectId or is null/string.");
      }
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkSeashellUsers();
