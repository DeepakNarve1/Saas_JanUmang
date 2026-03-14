require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../src/models/userModel");
const Role = require("../src/models/roleModel");

async function migrateRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // We use a raw query so Mongoose doesn't try to cast 'role' to ObjectId yet
    const users = await User.collection.find({ role: { $type: "string" } }).toArray();
    console.log(`Found ${users.length} users with string roles to migrate`);

    for (const user of users) {
      if (!user.tenantId) continue;
      
      const roleDoc = await Role.findOne({ name: user.role, tenantId: user.tenantId });
      
      if (roleDoc) {
        await User.collection.updateOne(
          { _id: user._id },
          { $set: { role: roleDoc._id } }
        );
        console.log(`Updated user ${user.email} role to ObjectId ${roleDoc._id}`);
      } else {
        console.warn(`No matching Role doc found for string name '${user.role}' on tenant ${user.tenantId}`);
      }
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateRoles();
