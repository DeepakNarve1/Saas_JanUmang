require("dotenv").config();
const mongoose = require("mongoose");
const Ward = require("../src/models/wardModel");
const District = require("../src/models/districtModel");
const Block = require("../src/models/blockModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const seedWards = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Seeding Wards...");

    // 1. Seed Indore Wards
    const indoreDist = await District.findOne({ name: "Indore" });

    if (!indoreDist) {
      console.warn("District 'Indore' not found in DB. Skipping Indore wards.");
    } else {
      // Find block using flexible regex
      const indoreBlock = await Block.findOne({
        name: { $regex: /Indore/i },
        district: indoreDist._id,
      });

      if (indoreBlock) {
        console.log(
          `Found Block: ${indoreBlock.name} for Indore. Seeding 85 wards...`,
        );
        for (let i = 1; i <= 85; i++) {
          await Ward.findOneAndUpdate(
            { city: "Indore", number: i },
            {
              name: `Ward ${i}`,
              number: i,
              city: "Indore",
              state: indoreBlock.state,
              division: indoreBlock.division,
              district: indoreBlock.district,
              parliament: indoreBlock.parliament,
              assembly: indoreBlock.assembly,
              block: indoreBlock._id,
            },
            { upsert: true },
          );
        }
        console.log("Indore Wards seeded.");
      } else {
        console.warn(
          `Block matching 'Indore' not found in district ${indoreDist.name}. Skipping.`,
        );
      }
    }

    // 2. Seed Bhopal Wards
    const bhopalDist = await District.findOne({ name: "Bhopal" });

    if (!bhopalDist) {
      console.warn("District 'Bhopal' not found in DB. Skipping Bhopal wards.");
    } else {
      const bhopalBlock = await Block.findOne({
        name: { $regex: /Bhopal/i },
        district: bhopalDist._id,
      });

      if (bhopalBlock) {
        console.log(
          `Found Block: ${bhopalBlock.name} for Bhopal. Seeding 85 wards...`,
        );
        for (let i = 1; i <= 85; i++) {
          await Ward.findOneAndUpdate(
            { city: "Bhopal", number: i },
            {
              name: `Ward ${i}`,
              number: i,
              city: "Bhopal",
              state: bhopalBlock.state,
              division: bhopalBlock.division,
              district: bhopalBlock.district,
              parliament: bhopalBlock.parliament,
              assembly: bhopalBlock.assembly,
              block: bhopalBlock._id,
            },
            { upsert: true },
          );
        }
        console.log("Bhopal Wards seeded.");
      } else {
        console.warn(
          `Block matching 'Bhopal' not found in district ${bhopalDist.name}. Skipping.`,
        );
      }
    }

    console.log("Ward seeding complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding wards:", error);
    process.exit(1);
  }
};

seedWards();
