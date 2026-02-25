require("dotenv").config();
const mongoose = require("mongoose");
const Block = require("./src/models/blockModel");
const Booth = require("./src/models/boothModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const seedBoothsWithHierarchy = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Seeding Booths...");

    // 1. Fetch all blocks
    const blocks = await Block.find({});

    if (blocks.length === 0) {
      console.log(
        "No blocks found. Please run seedBlocks.js or seedMasterData.js first.",
      );
      process.exit(0);
    }

    console.log(`Found ${blocks.length} blocks. Clearing existing booths...`);
    await Booth.deleteMany({});

    console.log("Generating booths with full hierarchy link...");

    const boothsToInsert = [];
    const BOOTHS_PER_BLOCK = 10; // Increased density for testing

    for (const block of blocks) {
      for (let i = 1; i <= BOOTHS_PER_BLOCK; i++) {
        const boothNumber = i;
        // Generate a 4 digit code e.g. B001
        const cleanBlockName = block.name
          .replace(/\s+/g, "")
          .toUpperCase()
          .slice(0, 3);
        const code = `${cleanBlockName}${String(boothNumber).padStart(3, "0")}`;

        boothsToInsert.push({
          name: `${block.name} Booth ${boothNumber}`,
          code: code,
          // CRITICAL: Inherit full hierarchy from block
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
      await Booth.insertMany(boothsToInsert);
      console.log(
        `Successfully created ${boothsToInsert.length} booths for ${blocks.length} blocks.`,
      );
    }
  } catch (error) {
    console.error("Error seeding booths:", error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedBoothsWithHierarchy();
