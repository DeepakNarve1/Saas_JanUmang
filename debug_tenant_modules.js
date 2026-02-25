const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "Server", ".env") });

const tenantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    enabledModules: [{ type: String }],
    // other fields loose typed
  },
  { strict: false },
);

const Tenant = mongoose.model("Tenant", tenantSchema);

async function checkTenants() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const tenants = await Tenant.find({});
    console.log(`Found ${tenants.length} tenants.`);

    tenants.forEach((t) => {
      console.log(`\nTenant: ${t.name} (${t._id})`);
      console.log(
        "Enabled Modules:",
        t.enabledModules ? t.enabledModules.join(", ") : "NONE",
      );

      // Check for panchayat variations
      const hasPlural = t.enabledModules?.includes("panchayats");
      const hasSingular = t.enabledModules?.includes("panchayat");

      console.log(`- Has 'panchayats' (plural): ${hasPlural}`);
      console.log(`- Has 'panchayat' (singular): ${hasSingular}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkTenants();
