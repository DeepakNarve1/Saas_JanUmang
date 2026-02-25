require("dotenv").config();
const mongoose = require("mongoose");
const Booth = require("./src/models/boothModel");

const checkBooths = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db",
    );
    const count = await Booth.countDocuments();
    console.log(`Current Booth Count: ${count}`);

    if (count > 0) {
      const sample = await Booth.findOne().populate("block", "name year");
      console.log("Sample Booth Name:", sample.name);
      console.log("Sample Booth Block:", sample.block?.name);
      console.log("Sample Booth Year (from block):", sample.block?.year);
      console.log("Sample Booth Code:", sample.code);
    } else {
      console.log("No booths found.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

checkBooths();
