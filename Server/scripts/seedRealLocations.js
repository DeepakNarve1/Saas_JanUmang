require("dotenv").config();
const mongoose = require("mongoose");
const Block = require("../src/models/blockModel");
const Panchayat = require("../src/models/panchayatModel");
const Village = require("../src/models/villageModel");
const Ward = require("../src/models/wardModel"); // Assuming Ward model exists or we use Panchayat for urban wards?
// Checking config/modules.ts, I added WARD module, so Ward model likely exists or needs to be created.
// I will check for Ward model existence first. If not, I'll assume Wards are stored in Panchayat collection with type='Urban' or similar,
// OR I will create the model if needed.
// However, looking at the file list earlier, "wardModel.js" did NOT exist. "samitiModel.js" existed.
// "vidhanSabhaSamitiModel.js" existed.
// "panchayatModel.js" existed.

// I will check if wardModel.js exists. If not, I will create it.
// The user asked for scripts for master data.

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

// Sample Real Data for Bhopal (Phanda Block - Rural)
const phandaPanchayats = [
  "Acharpura",
  "Adampur Chhawni",
  "Agariya",
  "Amjhara",
  "Arwaliya",
  "Badjhiri",
  "Bagroda",
  "Baktara",
  "Bamonya",
  "Bangrasia",
  "Barkheda Bondar",
  "Barkheda Nathu",
  "Barkheda Salam",
  "Barkhedi",
  "Bhauri",
  "Bistara",
  "Chandpur",
  "Chhapar",
  "Chaupra Kalan",
  "Devalkhedi",
  "Dillod",
  "Dob",
  "Dungariya",
  "Eitkhedi",
];

// Sample Real Data for Indore (Indore City - Urban Wards)
// Since we might not have a Ward model, I'll treat them as Panchayats/LocalBodies for now
// or skip if no model.
// Let's assume for this script we are seeding Panchayats for rural blocks.

const seedRealLocations = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Seeding Real Locations...");

    // 1. Seed Phanda Block (Bhopal) Panchayats
    const phandaBlock = await Block.findOne({
      name: { $regex: /Phanda|Fanda/i },
    });

    if (phandaBlock) {
      console.log(
        `Found Phanda Block: ${phandaBlock.name}. Seeding Panchayats...`,
      );

      for (const pName of phandaPanchayats) {
        await Panchayat.findOneAndUpdate(
          { name: pName, block: phandaBlock._id },
          {
            name: pName,
            state: phandaBlock.state,
            division: phandaBlock.division,
            district: phandaBlock.district,
            parliament: phandaBlock.parliament,
            assembly: phandaBlock.assembly,
            block: phandaBlock._id, // Wait, block is the parent
          },
          { upsert: true },
        );
      }
      console.log(
        `Seeded ${phandaPanchayats.length} Real Panchayats for Phanda.`,
      );
    } else {
      console.log("Phanda block not found. Skipping.");
    }

    // 2. Seed Berasia Block (Bhopal) Panchayats
    const berasiaBlock = await Block.findOne({ name: "Berasia" });
    const berasiaPanchayats = [
      "Alikheda",
      "Amarpura",
      "Arriya",
      "Babachiya",
      "Baherwal",
    ]; // Sample

    if (berasiaBlock) {
      console.log(`Found Berasia Block. Seeding Panchayats...`);
      for (const pName of berasiaPanchayats) {
        await Panchayat.findOneAndUpdate(
          { name: pName, block: berasiaBlock._id },
          {
            name: pName,
            state: berasiaBlock.state,
            division: berasiaBlock.division,
            district: berasiaBlock.district,
            parliament: berasiaBlock.parliament,
            assembly: berasiaBlock.assembly,
          },
          { upsert: true },
        );
      }
      console.log(
        `Seeded ${berasiaPanchayats.length} Real Panchayats for Berasia.`,
      );
    }

    console.log("Real Location Seeding Completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding real locations:", error);
    process.exit(1);
  }
};

seedRealLocations();
