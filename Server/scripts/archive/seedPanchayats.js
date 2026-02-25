require("dotenv").config();
const mongoose = require("mongoose");
const Panchayat = require("./src/models/panchayatModel");
const Booth = require("./src/models/boothModel");
const Block = require("./src/models/blockModel");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db",
    );
    console.log("MongoDB Connected for Seeding Panchayats...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const generatePanchayatName = (blockName, index) => {
  // Generate realistic looking (but dummy) Panchayat names
  // e.g., "Gram Panchayat [BlockName] [Index]"
  // To make it look more "real", we could add village suffixes but keeping it simple is safer.
  return `Gram Panchayat ${blockName} ${index}`;
};

const seedPanchayats = async () => {
  await connectDB();

  try {
    // 1. Fetch all Booths with their hierarchy
    const booths = await Booth.find({});

    if (booths.length === 0) {
      console.log("No booths found. Please run seedBooths.js first.");
      process.exit(0);
    }

    console.log(
      `Found ${booths.length} booths. Clearing existing panchayats...`,
    );
    await Panchayat.deleteMany({});

    // 2. Group booths by Block to assign Panchayats logically
    const boothsByBlock = {};
    for (const booth of booths) {
      const blockId = booth.block.toString();
      if (!boothsByBlock[blockId]) {
        boothsByBlock[blockId] = [];
      }
      boothsByBlock[blockId].push(booth);
    }

    const panchayatsToInsert = [];
    const BOOTHS_PER_PANCHAYAT = 2; // Average booths per panchayat

    console.log("Generating Panchayat data...");

    for (const blockId in boothsByBlock) {
      const blockBooths = boothsByBlock[blockId];
      // Get block name for naming convention (using the first booth's populated data would require populate, doing lookup map is better)
      // Or just fetch blocks separately. Let's assume we can get it from booth if populated, otherwise lookup.
      // Since I didn't populate in the find(), I need to fetch block name or use a generic one.
      // Let's quickly fetch the block name.
      const blockDoc = await Block.findById(blockId).select("name");
      const blockName = blockDoc ? blockDoc.name : "Block";

      let panchayatCounter = 1;

      // Process booths in chunks
      for (let i = 0; i < blockBooths.length; i += BOOTHS_PER_PANCHAYAT) {
        const chunk = blockBooths.slice(i, i + BOOTHS_PER_PANCHAYAT);
        const panchayatName = generatePanchayatName(
          blockName,
          panchayatCounter++,
        );

        for (const booth of chunk) {
          panchayatsToInsert.push({
            name: panchayatName,
            state: booth.state,
            division: booth.division,
            district: booth.district,
            parliament: booth.parliament,
            assembly: booth.assembly,
            block: booth.block,
            booth: booth._id, // Each booth gets a record linking it to this Panchayat
            // year was removed from model
          });
        }
      }
    }

    if (panchayatsToInsert.length > 0) {
      await Panchayat.insertMany(panchayatsToInsert);
      console.log(
        `Successfully created ${panchayatsToInsert.length} Panchayat records.`,
      );
    } else {
      console.log("No data generated.");
    }
  } catch (error) {
    console.error("Error seeding panchayats:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedPanchayats();
