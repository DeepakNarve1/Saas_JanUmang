require("dotenv").config();
const mongoose = require("mongoose");
const Panchayat = require("./src/models/panchayatModel");
const Booth = require("./src/models/boothModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const boothName = "Booth No 10 - Agar";
    const booth = await Booth.findOne({ name: boothName });

    if (booth) {
      console.log(`Found Booth: ${booth.name} (_id: ${booth._id})`);
      const panchayats = await Panchayat.find({ booth: booth._id });
      console.log(`Panchayats linked to this booth: ${panchayats.length}`);
      panchayats.forEach((p) => console.log(` - ${p.name}`));
    } else {
      console.log(`Booth '${boothName}' not found`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

run();
