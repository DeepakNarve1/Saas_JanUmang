const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const checkUserPerms = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const User = require("./src/models/userModel");
    const Role = require("./src/models/roleModel");
    const Permission = require("./src/models/permissionModel");

    const user = await User.findOne({
      email: "seashelladmin@example.com",
    }).populate({
      path: "role",
      populate: {
        path: "permissions",
      },
    });

    if (!user) {
      console.log("User not found");
      process.exit(1);
    }

    console.log("User:", user.name);
    console.log("Role:", user.role.name);
    console.log(
      "Permissions:",
      user.role.permissions.map((p) => p.name).sort(),
    );

    const panchayatPerms = user.role.permissions.filter((p) =>
      p.name.includes("panchayat"),
    );
    console.log(
      "Panchayat Related Perms:",
      panchayatPerms.map((p) => p.name),
    );

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUserPerms();
