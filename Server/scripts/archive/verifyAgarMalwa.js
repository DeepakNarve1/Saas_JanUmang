require("dotenv").config();
const mongoose = require("mongoose");
const Block = require("./src/models/blockModel");
const Booth = require("./src/models/boothModel");
const Panchayat = require("./src/models/panchayatModel");
const Village = require("./src/models/villageModel");
const Voter = require("./src/models/voterModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const blocks = await Block.find({
      name: { $in: ["Agar", "Barod", "Susner", "Nalkheda"] },
    });
    console.log(`Blocks Found: ${blocks.length}`);

    for (const block of blocks) {
      const boothCount = await Booth.countDocuments({ block: block._id });
      const panchayatCount = await Panchayat.countDocuments({
        block: block._id,
      });
      const villageCount = await Village.countDocuments({ block: block._id });
      const voterCount = await Voter.countDocuments({ block: block._id });
      console.log(
        `${block.name}: Booths=${boothCount}, Panchayats=${panchayatCount}, Villages=${villageCount}, Voters=${voterCount}`,
      );
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

run();
