/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./src/models/userModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const debugUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    // Use raw query to bypass Mongoose schema
    const users = await mongoose.connection
      .collection("users")
      .find({})
      .toArray();
    console.log(`Analyzing ${users.length} raw user documents...`);

    for (const user of users) {
      console.log("---------------------------------------------------");
      console.log(`User: ${user.name} (${user.email})`);
      console.log(`  _id: ${user._id}`);

      if (user.tenant) console.log(`  FIELD 'tenant' (raw): ${user.tenant}`);
      if (user.tenantId)
        console.log(`  FIELD 'tenantId' (raw): ${user.tenantId}`);
      if (!user.tenant && !user.tenantId) console.log("NO TENANT INFO FOUND");
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

debugUsers();
