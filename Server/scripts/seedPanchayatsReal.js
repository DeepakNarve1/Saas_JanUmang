require("dotenv").config();
const mongoose = require("mongoose");
const Panchayat = require("../src/models/panchayatModel");
const Block = require("../src/models/blockModel");
// We need to bypass the "Booth is required" constraint if we don't have booth data yet.
// However, the model says Booth is required.
// If valid data for Panchayats exists without knowing exact booth mapping, we might need a dummy booth or update schema.
// BUT, usually Panchayats contain multiple booths, not the other way around.
// The current schema `booth: { type: ObjectId, required: true }` suggests a Panchayat belongs to a SINGLE Booth?
// That sounds inverted. A Gram Panchayat usually covers a village or group of villages, and has multiple polling booths.
// Or maybe "Booth" here means something else?
// If the schema enforces it, we must provide it.
// I will fetch a dummy booth or first booth of the block to satisfy constraints, OR
// I will modify the schema to make booth optional if that's the blocker for seeding real Panchayats.
// Given strict "Booth is required", I will try to find a booth for the block.

const Booth = require("../src/models/boothModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

// Large list of Real Panchayats for Demo Blocks (Bhopal - Phanda, Berasia)
const realPanchayatsData = {
  Phanda: [
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
    "Fanda Kalan",
    "Fanda Khurd",
    "Gunga",
    "Harrakheda",
    "Hinotiya Sadak",
    "Islamnagar",
    "Jamuniya Kalan",
    "Kalkheda",
    "Khajuri Sadak",
    "Khori",
    "Kolukhedi",
    "Mugaliya Chap",
    "Mugaliya Hat",
    "Nipaniya Jat",
    "Parvaliya Sadak",
    "Phanda",
    "Ratibad",
    "Rusalli",
    "Sagoni",
    "Samardha",
    "Sukhi Sewaniya",
    "Tarisechan",
    "Tumda",
  ],
  Berasia: [
    "Alikheda",
    "Amarpura",
    "Arriya",
    "Babachiya",
    "Baherwal",
    "Bandaru",
    "Barrai",
    "Beelkhodra",
    "Berkhedi",
    "Bhankheda",
    "Bhojapura",
    "Bhont",
    "Damkheda",
    "Dhamarra",
    "Dhaturiya",
    "Dungariya",
    "Gara",
    "Gol Khedi",
    "Gujartodi",
    "Harrakheda",
    "Imaliya",
    "Jhirniya",
    "Kadhaiya Kota",
    "Kalara",
    "Karhaiya",
    "Khajuria Ramdas",
    "Khumari",
    "Kulhor",
    "Laloi",
    "Langarpur",
    "Maji Idgah",
    "Manikhedi",
    "Nalkheda",
    "Narela",
    "Pamas Kalan",
    "Pipalkheda",
    "Runaha",
    "Sagoni",
    "Sohaya",
    "Vinayaka",
  ],
};

const seedPanchayats = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected for Seeding Panchayats...");

    // CLEAR OLD DATA
    console.log("Clearing existing Panchayats...");
    await Panchayat.deleteMany({});
    console.log("Old Panchayats cleared.");

    // Iterate over blocks in our data
    for (const [blockNamePart, panchayatNames] of Object.entries(
      realPanchayatsData,
    )) {
      // Find the Block
      const block = await Block.findOne({
        name: { $regex: new RegExp(blockNamePart, "i") },
      });

      if (!block) {
        console.warn(`Block matching '${blockNamePart}' not found. Skipping.`);
        continue;
      }

      console.log(
        `Processing Block: ${block.name} (${panchayatNames.length} Panchayats)`,
      );

      // We need a Booth to satisfy the schema.
      // Strategy: Find ANY booth in this block. If none, create a "Default Booth".
      let booth = await Booth.findOne({ block: block._id });

      if (!booth) {
        console.log(
          `  No booth found for ${block.name}. Creating dummy booth...`,
        );
        booth = await Booth.create({
          name: `Default Booth - ${block.name}`,
          code: `DEF-${block.name.substring(0, 3).toUpperCase()}`,
          block: block._id,
          state: block.state,
          division: block.division,
          district: block.district,
          parliament: block.parliament,
          assembly: block.assembly,
        });
      }

      const panchayatsToInsert = panchayatNames.map((pName) => ({
        name: pName,
        state: block.state,
        division: block.division,
        district: block.district,
        parliament: block.parliament,
        assembly: block.assembly,
        block: block._id,
        booth: booth._id, // Schema requires this.
      }));

      if (panchayatsToInsert.length > 0) {
        await Panchayat.insertMany(panchayatsToInsert);
        console.log(
          `  Inserted ${panchayatsToInsert.length} Panchayats for ${block.name}`,
        );
      }
    }

    console.log("Panchayat seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding panchayats:", error);
    process.exit(1);
  }
};

seedPanchayats();
