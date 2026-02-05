require("dotenv").config();
const mongoose = require("mongoose");
const Block = require("./src/models/blockModel");
const Booth = require("./src/models/boothModel");
const Assembly = require("./src/models/assemblyModel");
const Parliament = require("./src/models/parliamentModel");
const District = require("./src/models/districtModel");
const Division = require("./src/models/divisionModel");
const State = require("./src/models/stateModel");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db",
    );
    console.log("MongoDB Connected for Seeding Booths...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedBooths = async () => {
  await connectDB();

  try {
    // 1. Fetch all blocks
    const blocks = await Block.find({});

    if (blocks.length === 0) {
      console.log(
        "No blocks found. Please run seedBlocks.js first to create blocks.",
      );
      process.exit(0);
    }

    console.log(`Found ${blocks.length} blocks. Clearing existing booths...`);
    await Booth.deleteMany({});

    console.log("Generatng dummy booths...");

    const boothsToInsert = [];
    const BOOTHS_PER_BLOCK = 5; // Generate 5 booths per block

    for (const block of blocks) {
      for (let i = 1; i <= BOOTHS_PER_BLOCK; i++) {
        const boothNumber = i;
        // Generate a 4 digit code e.g. B001
        // Or unique code like BlockName_001
        const cleanBlockName = block.name
          .replace(/\s+/g, "")
          .toUpperCase()
          .slice(0, 3);
        const code = `${cleanBlockName}${String(boothNumber).padStart(3, "0")}`;

        boothsToInsert.push({
          name: `${block.name} Booth ${boothNumber}`,
          code: code,
          state: block.state,
          division: block.division,
          district: block.district,
          parliament: block.parliament,
          assembly: block.assembly,
          block: block._id,
          year: block.year || "2024",
        });
      }
    }

    if (boothsToInsert.length > 0) {
      // Insert in chunks to avoid memory issues if too large, though 50*5=250 is small.
      await Booth.insertMany(boothsToInsert);
      console.log(
        `Successfully created ${boothsToInsert.length} dummy booths for ${blocks.length} blocks.`,
      );
    } else {
      console.log("No booths generated.");
    }
  } catch (error) {
    console.error("Error seeding booths:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedBooths();
