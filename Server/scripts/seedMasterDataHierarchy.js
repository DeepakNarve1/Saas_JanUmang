/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");

// Load Models
const State = require("../src/models/stateModel");
const Division = require("../src/models/divisionModel");
const District = require("../src/models/districtModel");
const Parliament = require("../src/models/parliamentModel");
const Assembly = require("../src/models/assemblyModel");
const Block = require("../src/models/blockModel");
const Booth = require("../src/models/boothModel");
const Tenant = require("../src/models/tenantModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const seedMasterData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Seeding Master Data Hierarchy...");

    // Remove stale index on 'code' if it exists, as it conflicts with multi-tenant data
    try {
      await mongoose.connection.collection("booths").dropIndex("code_1");
      console.log(
        "⚠️  Dropped stale unique index 'code_1' from booths collection.",
      );
    } catch (e) {
      // index might not exist, which is fine
    }

    // Remove stale index on 'block + code' if it exists
    try {
      await mongoose.connection
        .collection("booths")
        .dropIndex("block_1_code_1");
      console.log(
        "⚠️  Dropped stale unique index 'block_1_code_1' from booths collection.",
      );
    } catch (e) {
      // index might not exist, which is fine
    }

    // 1. Define the Hierarchy Data
    // We will create a sample hierarchy for Madhya Pradesh -> Indore
    const hierarchyData = {
      stateName: "Madhya Pradesh",
      divisionName: "Indore Division",
      districtName: "Indore",
      parliamentName: "Indore",
      assemblyName: "Indore-1",
      blockName: "Indore Urban",
    };

    // 2. Create/Find State
    console.log(`Processing State: ${hierarchyData.stateName}`);
    const state = await State.findOneAndUpdate(
      { name: hierarchyData.stateName },
      { name: hierarchyData.stateName },
      { upsert: true, new: true },
    );
    console.log(`✅ State ID: ${state._id}`);

    // 3. Create/Find Division
    console.log(`Processing Division: ${hierarchyData.divisionName}`);
    const division = await Division.findOneAndUpdate(
      { name: hierarchyData.divisionName, state: state._id },
      { name: hierarchyData.divisionName, state: state._id },
      { upsert: true, new: true },
    );
    console.log(`✅ Division ID: ${division._id}`);

    // 4. Create/Find District
    console.log(`Processing District: ${hierarchyData.districtName}`);
    const district = await District.findOneAndUpdate(
      { name: hierarchyData.districtName, division: division._id },
      { name: hierarchyData.districtName, division: division._id },
      { upsert: true, new: true },
    );
    console.log(`✅ District ID: ${district._id}`);

    // 5. Create/Find Parliament
    console.log(`Processing Parliament: ${hierarchyData.parliamentName}`);
    const parliament = await Parliament.findOneAndUpdate(
      { name: hierarchyData.parliamentName, division: division._id }, // Uniqueness scope
      {
        name: hierarchyData.parliamentName,
        division: division._id,
        district: district._id, // Linking district as well
      },
      { upsert: true, new: true },
    );
    console.log(`✅ Parliament ID: ${parliament._id}`);

    // 6. Create/Find Assembly
    console.log(`Processing Assembly: ${hierarchyData.assemblyName}`);
    const assembly = await Assembly.findOneAndUpdate(
      { name: hierarchyData.assemblyName, parliament: parliament._id },
      {
        name: hierarchyData.assemblyName,
        state: state._id,
        division: division._id,
        district: district._id,
        parliament: parliament._id,
      },
      { upsert: true, new: true },
    );
    console.log(`✅ Assembly ID: ${assembly._id}`);

    // 7. Create/Find Block
    console.log(`Processing Block: ${hierarchyData.blockName}`);
    const block = await Block.findOneAndUpdate(
      { name: hierarchyData.blockName, assembly: assembly._id },
      {
        name: hierarchyData.blockName,
        state: state._id,
        division: division._id,
        district: district._id,
        parliament: parliament._id,
        assembly: assembly._id,
        year: new Date().getFullYear().toString(),
      },
      { upsert: true, new: true },
    );
    console.log(`✅ Block ID: ${block._id}`);

    // 8. Create Booths for Tenants
    const tenants = await Tenant.find({});
    if (tenants.length === 0) {
      console.warn("No tenants found. Skipping Booth creation.");
    } else {
      console.log(`Found ${tenants.length} tenants. Seeding Booths...`);

      for (const tenant of tenants) {
        console.log(`  Processing Tenant: ${tenant.name}`);

        // Create 5 sample booths for this block/tenant
        for (let i = 1; i <= 5; i++) {
          const boothCode = `B${i}-${hierarchyData.blockName.substring(0, 3).toUpperCase()}`;

          await Booth.findOneAndUpdate(
            {
              code: boothCode,
              tenantId: tenant._id,
              block: block._id,
            },
            {
              name: `Booth ${i} - ${hierarchyData.blockName}`,
              code: boothCode,
              year: new Date().getFullYear().toString(),

              // Full Hierarchy Links
              block: block._id,
              assembly: assembly._id,
              parliament: parliament._id,
              district: district._id,
              division: division._id,
              state: state._id,

              tenantId: tenant._id,
            },
            { upsert: true, new: true },
          );
        }
      }
      console.log("✅ Booths seeded for all tenants.");
    }

    console.log("Master Data Hierarchy Seeding Complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding master data:", error);
    process.exit(1);
  }
};

seedMasterData();
