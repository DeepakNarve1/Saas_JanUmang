require("dotenv").config();
const mongoose = require("mongoose");
const Block = require("./src/models/blockModel");

const checkData = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db",
    );
    const count = await Block.countDocuments();
    console.log(`Current Block Count: ${count}`);

    if (count > 0) {
      const sample = await Block.findOne();
      console.log("Sample Block:", sample.name);
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

checkData();
