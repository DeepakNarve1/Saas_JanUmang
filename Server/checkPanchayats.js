require("dotenv").config();
const mongoose = require("mongoose");
const Panchayat = require("./src/models/panchayatModel");

const checkPanchayats = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db",
    );
    const count = await Panchayat.countDocuments();
    console.log(`Current Panchayat Count: ${count}`);

    if (count > 0) {
      const sample = await Panchayat.findOne()
        .populate({ path: "block", select: "name" })
        .populate({ path: "booth", select: "name code" });

      console.log("Sample Panchayat Name:", sample.name);
      console.log("Sample Panchayat Block:", sample.block?.name);
      console.log(
        "Sample Panchayat Booth:",
        sample.booth?.name,
        `(${sample.booth?.code})`,
      );
    } else {
      console.log("No panchayats found.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
};

checkPanchayats();
