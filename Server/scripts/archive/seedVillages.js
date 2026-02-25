require("dotenv").config();
const mongoose = require("mongoose");
const Village = require("./src/models/villageModel");
const Panchayat = require("./src/models/panchayatModel");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db",
    );
    console.log("MongoDB Connected for Seeding Villages...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const villagePrefixes = [
  "Ram",
  "Gopal",
  "Mohan",
  "Shyam",
  "Krishna",
  "Sita",
  "Lakshmi",
  "Durga",
  "Bharat",
  "Madhav",
  "Govind",
  "Hari",
  "Shiv",
  "Ambe",
  "Vijay",
  "Anand",
  "Prem",
  "Shanti",
  "Kalyan",
  "Raja",
  "Rani",
  "Dev",
  "Suraj",
  "Chandra",
];

const villageSuffixes = [
  "pur",
  "gaon",
  "kheda",
  "nagar",
  "garh",
  "wadi",
  "bad",
  "pura",
  "tola",
  "ganj",
];

const generateVillageName = (index) => {
  const prefix = villagePrefixes[index % villagePrefixes.length];
  const suffix =
    villageSuffixes[
      Math.floor(index / villagePrefixes.length) % villageSuffixes.length
    ];
  return `${prefix}${suffix}`;
};

const seedVillages = async () => {
  await connectDB();

  try {
    // 1. Clear existing villages
    console.log("Clearing old village data...");
    await Village.deleteMany({});
    console.log("Existing village data cleared.");

    // 2. Fetch all Panchayats
    const panchayats = await Panchayat.find({});

    if (panchayats.length === 0) {
      console.log("No panchayats found. Please run seedPanchayats.js first.");
      process.exit(0);
    }

    console.log(
      `Found ${panchayats.length} panchayats. Generating villages...`,
    );

    const villagesToInsert = [];
    const VILLAGES_PER_PANCHAYAT = 2; // Realistically 1-3 villages per panchayat

    for (const panchayat of panchayats) {
      for (let i = 1; i <= VILLAGES_PER_PANCHAYAT; i++) {
        // Use a combination of panchayat ID and index to get a "unique-ish" name from our lists
        const nameIndex =
          (parseInt(panchayat._id.toString().slice(-4), 16) + i) %
          (villagePrefixes.length * villageSuffixes.length);
        const villageName = generateVillageName(nameIndex);

        villagesToInsert.push({
          name: villageName,
          state: panchayat.state,
          division: panchayat.division,
          district: panchayat.district,
          parliament: panchayat.parliament,
          assembly: panchayat.assembly,
          block: panchayat.block,
          booth: panchayat.booth,
          panchayat: panchayat._id,
          status: true,
        });
      }
    }

    if (villagesToInsert.length > 0) {
      // Use insertMany for efficiency
      // Filter out duplicates if any (due to our naming logic)
      const uniqueVillages = [];
      const seen = new Set();

      for (const v of villagesToInsert) {
        const key = `${v.name}-${v.block}`;
        if (!seen.has(key)) {
          uniqueVillages.push(v);
          seen.add(key);
        }
      }

      await Village.insertMany(uniqueVillages);
      console.log(
        `Successfully added ${uniqueVillages.length} real-looking villages.`,
      );
    } else {
      console.log("No villages generated.");
    }
  } catch (error) {
    console.error("Error seeding villages:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

seedVillages();
