require("dotenv").config();
const mongoose = require("mongoose");
const Voter = require("./src/models/voterModel");
const Village = require("./src/models/villageModel");
const Booth = require("./src/models/boothModel"); // Required for population

// Get number of entries from command line or default to 10
const args = process.argv.slice(2);
const NUMBER_OF_ENTRIES = args[0] ? parseInt(args[0]) : 10;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedVoters = async () => {
  if (isNaN(NUMBER_OF_ENTRIES) || NUMBER_OF_ENTRIES <= 0) {
    console.error("Please provide a valid number of entries.");
    process.exit(1);
  }

  await connectDB();

  try {
    console.log(`Preparing to seed ${NUMBER_OF_ENTRIES} voters...`);

    // 1. Fetch valid hierarchy contexts with explicit field selection
    // populating 'booth' to get the code for the new 'boothno' field
    const villages = await Village.find({
      state: { $exists: true },
      division: { $exists: true },
      district: { $exists: true },
      booth: { $exists: true },
    })
      .populate("booth") // Populate to get access to booth code
      .limit(100)
      .lean();

    if (villages.length === 0) {
      console.error("No valid villages found (with full hierarchy fields)!");
      console.log(
        "Please run 'node seedLowerHierarchy.js' to create valid villages.",
      );
      process.exit(1);
    }

    console.log(`Found ${villages.length} valid villages for context.`);
    console.log("Sample Village keys:", Object.keys(villages[0]));
    if (!villages[0].state)
      console.error("WARNING: Sample village has no state field!");

    const firstNames = [
      "Aarav",
      "Vihaan",
      "Aditya",
      "Sai",
      "Arjun",
      "Reyansh",
      "Muhammad",
      "Rohan",
      "Krishna",
      "Ishaan",
      "Ananya",
      "Diya",
      "Saanvi",
      "Aadhya",
      "Pari",
      "Kiara",
      "Fatima",
      "Riya",
      "Myra",
      "Zara",
    ];
    const fatherNames = [
      "Ramesh",
      "Suresh",
      "Mahesh",
      "Dinesh",
      "Rajesh",
      "Mukesh",
      "Naresh",
      "Ganesh",
      "Vijay",
      "Ajay",
    ];
    const surnames = [
      "Sharma",
      "Verma",
      "Singh",
      "Patel",
      "Gupta",
      "Kumar",
      "Yadav",
      "Jain",
      "Mehta",
      "Shah",
      "Khan",
      "Ali",
    ];
    const castes = ["General", "OBC", "SC", "ST"];

    const votersToInsert = [];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      // Randomly pick a village to ensure valid hierarchy linkage
      const randomVillage =
        villages[Math.floor(Math.random() * villages.length)];

      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = surnames[Math.floor(Math.random() * surnames.length)];
      const father =
        fatherNames[Math.floor(Math.random() * fatherNames.length)];

      const voterData = {
        name: `${fName} ${lName}`,
        fatherName: `${father} ${lName}`,
        mobileNumber: `9${Math.floor(100000000 + Math.random() * 900000000)}`, // Random 10 digit starting with 9
        age: Math.floor(Math.random() * (90 - 18 + 1)) + 18,
        cast: castes[Math.floor(Math.random() * castes.length)],
        subcast: "Local",
        fulladdress: `H.No ${Math.floor(Math.random() * 999)}, Near Temple, ${randomVillage.name}`,

        // Unique Voter ID: TIMESTAMP + RANDOM + LOOP_INDEX
        voterId: `V-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}${i}`,

        // Link Relations from selected Village
        state: randomVillage.state,
        division: randomVillage.division,
        district: randomVillage.district,
        parliament: randomVillage.parliament,
        assembly: randomVillage.assembly,
        block: randomVillage.block,
        panchayat: randomVillage.panchayat,
        village: randomVillage._id,
        // Village.booth is now a populated object (from the .populate() call above)
        // We need to store the ID in 'booth' and the code in 'boothno'
        booth: randomVillage.booth?._id || randomVillage.booth,
        boothno: randomVillage.booth?.code || "N/A",

        fallaMarjra: "Main Ward",
        isActive: true,
        source: "NEW",
      };

      votersToInsert.push(voterData);
    }

    // Insert in batches if large
    if (votersToInsert.length > 0) {
      await Voter.insertMany(votersToInsert);
      console.log(`✅ Successfully seeded ${votersToInsert.length} voters.`);
    }
  } catch (error) {
    console.error("❌ Error seeding voters:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

seedVoters();
