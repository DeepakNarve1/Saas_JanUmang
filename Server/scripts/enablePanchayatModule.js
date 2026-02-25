const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const logFile = path.resolve(__dirname, "../enablePanchayatModule.log");
function log(msg) {
  try {
    fs.appendFileSync(logFile, msg + "\n");
    console.log(msg);
  } catch (e) {
    console.error("Failed to write to log file: " + e);
  }
}

log("Starting script at " + new Date().toISOString());
log("MONGO_URI: " + (process.env.MONGO_URI ? "Found" : "Missing"));

const TenantSchema = new mongoose.Schema({
  name: String,
  enabledModules: [String],
});

const Tenant = mongoose.model("Tenant", TenantSchema, "tenants");

async function enablePanchayatModule() {
  try {
    log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    log("✅ Connected to MongoDB");

    const tenants = await Tenant.find({});
    log(`Found ${tenants.length} tenants.`);

    for (const tenant of tenants) {
      if (!tenant.enabledModules) tenant.enabledModules = [];
      if (!tenant.enabledModules.includes("panchayats")) {
        log(`Enabling panchayats for ${tenant.name}...`);
        tenant.enabledModules.push("panchayats");
        await tenant.save();
        log(`✅ Enabled for ${tenant.name}`);
      } else {
        log(`ℹ️  Already enabled for ${tenant.name}`);
      }
    }

    log("Done.");
    process.exit(0);
  } catch (error) {
    log("Error: " + error);
    process.exit(1);
  }
}

enablePanchayatModule();
