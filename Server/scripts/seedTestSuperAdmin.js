const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../src/models/userModel");
const Role = require("../src/models/roleModel");

const seedSuperAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("MongoDB URI:", process.env.MONGO_URI ? "Found" : "Not found");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // First, find or create a superadmin role
    console.log("\nLooking for superadmin role...");
    let superadminRole = await Role.findOne({ name: "superadmin" });

    if (!superadminRole) {
      console.log("Superadmin role not found, checking for admin role...");
      superadminRole = await Role.findOne({ name: "admin" });
    }

    if (!superadminRole) {
      console.log("❌ No admin or superadmin role found in database.");
      console.log("Please run: npm run seed");
      console.log("Or create roles first using the admin panel.");
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log(
      `✅ Found role: ${superadminRole.name} (${superadminRole._id})`,
    );

    const email = "superadmin@janumang.com";
    const password = "adminpassword123";

    console.log(`\nLooking for user: ${email}`);
    let user = await User.findOne({ email });

    if (user) {
      console.log("User found, updating...");
      user.password = password;
      user.level = "system_admin";
      user.userType = "superadmin";
      user.role = superadminRole._id; // Assign the role
      await user.save();
      console.log("✅ SuperAdmin updated successfully!");
    } else {
      console.log("User not found, creating new...");
      user = await User.create({
        name: "System Super Admin",
        email: email,
        password: password,
        role: superadminRole._id, // Assign the role
        level: "system_admin",
        userType: "superadmin",
        isActive: true,
      });
      console.log("✅ SuperAdmin created successfully!");
    }

    console.log("\n" + "=".repeat(50));
    console.log("📧 Login Credentials:");
    console.log("=".repeat(50));
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ${superadminRole.name}`);
    console.log(`   Level:    system_admin`);
    console.log("=".repeat(50) + "\n");

    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedSuperAdmin();
