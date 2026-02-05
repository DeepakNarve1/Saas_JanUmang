require("dotenv").config();
const mongoose = require("mongoose");
const Block = require("./src/models/blockModel");
const Booth = require("./src/models/boothModel");
const Panchayat = require("./src/models/panchayatModel");
const Village = require("./src/models/villageModel");

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Lower Hierarchy...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedLowerHierarchy = async () => {
  await connectDB();

  try {
    // Fetch all blocks to attach data to
    const blocks = await Block.find({});
    console.log(`Found ${blocks.length} blocks. Generating lower hierarchy...`);

    if (blocks.length === 0) {
      console.log("No blocks found! Please run seedMasterData.js first.");
      process.exit(0);
    }

    let boothCount = 0;
    let panchayatCount = 0;
    let villageCount = 0;

    // Process in chunks or just all (assuming < 1000 blocks for now, it's fine)
    // If too many blocks, maybe limit?
    // Let's limit to first 50 blocks for speed if there are too many, or just do all if user wants "all".
    // The user said "panchayat and all other master data", so I should try to cover a good amount.
    // Let's do for all blocks found.

    for (const block of blocks) {
      // Create 2 dummy booths per block
      for (let i = 1; i <= 2; i++) {
        const boothData = {
          name: `Booth ${i} - ${block.name}`,
          // Make code unique by adding random digits or part of ID
          code: `B${block.name.substring(0, 3).toUpperCase()}${i}-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 100)}`,
          block: block._id,
          state: block.state,
          division: block.division,
          district: block.district,
          parliament: block.parliament,
          assembly: block.assembly,
        };

        // Upsert Booth
        let booth = await Booth.findOneAndUpdate(
          { name: boothData.name, block: block._id },
          boothData,
          { upsert: true, new: true },
        );
        boothCount++;

        // Create 1 Panchayat for this Booth
        const panchayatData = {
          name: `Panchayat ${i} - ${block.name}`,
          state: block.state,
          division: block.division,
          district: block.district,
          parliament: block.parliament,
          assembly: block.assembly,
          block: block._id,
          booth: booth._id, // Required by schema
        };

        let panchayat = await Panchayat.findOneAndUpdate(
          { name: panchayatData.name, block: block._id },
          panchayatData,
          { upsert: true, new: true },
        );
        panchayatCount++;

        // Create 2 Villages for this Panchayat
        for (let v = 1; v <= 2; v++) {
          const villageData = {
            name: `Village ${v} - ${panchayat.name}`,
            state: block.state,
            division: block.division,
            district: block.district,
            parliament: block.parliament,
            assembly: block.assembly,
            block: block._id,
            booth: booth._id, // Required by schema
            panchayat: panchayat._id, // Required by schema
            status: true,
          };

          await Village.findOneAndUpdate(
            { name: villageData.name, panchayat: panchayat._id },
            villageData,
            { upsert: true },
          );
          villageCount++;
        }
      }
      process.stdout.write("."); // Progress indicator
    }

    console.log("\nSeeding Complete!");
    console.log(
      `Created/Updated: ${boothCount} Booths, ${panchayatCount} Panchayats, ${villageCount} Villages.`,
    );
  } catch (error) {
    console.error("Error seeding lower hierarchy:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedLowerHierarchy();
