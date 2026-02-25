const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const check = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const User = require("./src/models/userModel");
    const Role = require("./src/models/roleModel");
    const Tenant = require("./src/models/tenantModel");

    const user = await User.findOne({
      email: "seashelladmin@example.com",
    }).populate("role");
    const tenant = await Tenant.findOne({ organizationId: "SEASHELL" });

    console.log("User Role Name:", user.role.name);
    console.log("Tenant Enabled Modules:", tenant.enabledModules);

    const perms = await mongoose
      .model("Permission")
      .find({ _id: { $in: user.role.permissions } });
    console.log("User Permission Names:", perms.map((p) => p.name).sort());

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

check();
