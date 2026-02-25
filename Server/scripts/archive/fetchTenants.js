require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const Tenant = mongoose.connection.db.collection("tenants");
    const tenants = await Tenant.find({}).toArray();
    console.log("Tenants:", JSON.stringify(tenants, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

run();
