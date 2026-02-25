/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const Tenant = require("./src/models/tenantModel");
const User = require("./src/models/userModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const debugUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    const users = await User.find({});
    console.log(`Analyzing ${users.length} users...`);

    for (const user of users) {
      console.log("---------------------------------------------------");
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  _id: ${user._id}`);

      // Check 'tenant' field (old?)
      if (user.toObject().tenant) {
        console.log(`  FIELD 'tenant': ${user.toObject().tenant}`);
      } else {
        console.log(`  FIELD 'tenant': <undefined>`);
      }

      // Check 'tenantId' field (new?)
      if (user.tenantId) {
        console.log(`  FIELD 'tenantId': ${user.tenantId}`);
      } else {
        console.log(`  FIELD 'tenantId': <undefined>`);
      }
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

debugUsers();
