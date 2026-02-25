const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("../src/models/userModel");

const findSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // Find users with level system_admin or superadmin, or userType superadmin
    const users = await User.find({
      $or: [
        { level: { $in: ["system_admin", "superadmin"] } },
        { userType: "superadmin" },
      ],
    });

    if (users.length > 0) {
      console.log("Found superadmins:");
      users.forEach((u) =>
        console.log(
          `- Email: ${u.email}, Level: ${u.level}, Type: ${u.userType}`,
        ),
      );
    } else {
      console.log("No superadmins found.");
      // List all users just in case
      const allUsers = await User.find().limit(5);
      console.log("Sample users:");
      allUsers.forEach((u) =>
        console.log(
          `- Email: ${u.email}, Level: ${u.level}, Type: ${u.userType}`,
        ),
      );
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

findSuperAdmin();
