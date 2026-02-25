/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const Booth = require("../src/models/boothModel");
const Block = require("../src/models/blockModel");
const District = require("../src/models/districtModel");
const Tenant = require("../src/models/tenantModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const seedBooths = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Seeding Booths...");

    // Fetch all tenants
    const tenants = await Tenant.find({});
    if (tenants.length === 0) {
      console.warn(
        "No tenants found. Cannot seed booths as tenantId is required.",
      );
      process.exit(1);
    }
    console.log(`Found ${tenants.length} tenants.`);

    // 1. Seed Indore Booths
    const indoreDist = await District.findOne({ name: "Indore" });

    if (!indoreDist) {
      console.warn(
        "District 'Indore' not found in DB. Skipping Indore booths.",
      );
    } else {
      // Find block using flexible regex
      const indoreBlock = await Block.findOne({
        name: { $regex: /Indore/i },
        district: indoreDist._id,
      });

      if (indoreBlock) {
        console.log(
          `Found Block: ${indoreBlock.name} for Indore. Seeding Booths for all tenants...`,
        );

        for (const tenant of tenants) {
          console.log(`  Seeding for tenant: ${tenant.name}`);
          for (let i = 1; i <= 10; i++) {
            // 10 booths per tenant per block
            const boothCode = `IND-${indoreBlock.name.substring(0, 3).toUpperCase()}-${i}`;

            await Booth.findOneAndUpdate(
              { code: boothCode, tenantId: tenant._id, block: indoreBlock._id },
              {
                name: `Booth ${i} - ${indoreBlock.name}`,
                code: boothCode,
                year: new Date().getFullYear().toString(),
                block: indoreBlock._id,
                state: indoreBlock.state,
                division: indoreBlock.division,
                district: indoreBlock.district,
                parliament: indoreBlock.parliament,
                assembly: indoreBlock.assembly,
                tenantId: tenant._id,
              },
              { upsert: true, new: true },
            );
          }
        }
        console.log("Indore Booths seeded.");
      } else {
        console.warn(
          `Block matching 'Indore' not found in district ${indoreDist.name}. Skipping.`,
        );
      }
    }

    // 2. Seed Bhopal Booths
    const bhopalDist = await District.findOne({ name: "Bhopal" });

    if (!bhopalDist) {
      console.warn(
        "District 'Bhopal' not found in DB. Skipping Bhopal booths.",
      );
    } else {
      const bhopalBlock = await Block.findOne({
        name: { $regex: /Bhopal/i },
        district: bhopalDist._id,
      });

      if (bhopalBlock) {
        console.log(
          `Found Block: ${bhopalBlock.name} for Bhopal. Seeding Booths for all tenants...`,
        );
        for (const tenant of tenants) {
          console.log(`  Seeding for tenant: ${tenant.name}`);
          for (let i = 1; i <= 10; i++) {
            const boothCode = `BPL-${bhopalBlock.name.substring(0, 3).toUpperCase()}-${i}`;

            await Booth.findOneAndUpdate(
              { code: boothCode, tenantId: tenant._id, block: bhopalBlock._id },
              {
                name: `Booth ${i} - ${bhopalBlock.name}`,
                code: boothCode,
                year: new Date().getFullYear().toString(),
                block: bhopalBlock._id,
                state: bhopalBlock.state,
                division: bhopalBlock.division,
                district: bhopalBlock.district,
                parliament: bhopalBlock.parliament,
                assembly: bhopalBlock.assembly,
                tenantId: tenant._id,
              },
              { upsert: true, new: true },
            );
          }
        }
        console.log("Bhopal Booths seeded.");
      } else {
        console.warn(
          `Block matching 'Bhopal' not found in district ${bhopalDist.name}. Skipping.`,
        );
      }
    }

    console.log("Booth seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding booths:", error);
    process.exit(1);
  }
};

seedBooths();
