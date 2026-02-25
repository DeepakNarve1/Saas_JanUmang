require("dotenv").config();
const mongoose = require("mongoose");
const Voter = require("./src/models/voterModel");
const Village = require("./src/models/villageModel"); // To get hierarchy context

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Voters...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedVoters = async () => {
  await connectDB();

  const NUMBER_OF_ENTRIES = 20;

  try {
    // We need valid hierarchy IDs (State -> Village) to satisfy constraints.
    // Fetch a village with all populated paths.
    const villages = await Village.find().limit(5);

    if (villages.length === 0) {
      console.log(
        "No villages found. Please run 'node seedLowerHierarchy.js' first.",
      );
      process.exit(1);
    }

    const entries = [];
    const casts = ["General", "OBC", "SC", "ST"];
    const givenNames = [
      "Rajesh",
      "Sunita",
      "Amit",
      "Priya",
      "Vikram",
      "Anita",
      "Suresh",
      "Radha",
    ];
    const surnames = [
      "Sharma",
      "Verma",
      "Singh",
      "Patel",
      "Yadav",
      "Gupta",
      "Joshi",
      "Mishra",
    ];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      // Pick a random village context
      const village = villages[Math.floor(Math.random() * villages.length)];

      const firstName =
        givenNames[Math.floor(Math.random() * givenNames.length)];
      const lastName = surnames[Math.floor(Math.random() * surnames.length)];

      entries.push({
        name: `${firstName} ${lastName}`,
        fatherName: `Father of ${firstName}`,
        mobileNumber: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        age: 18 + Math.floor(Math.random() * 60),
        cast: casts[Math.floor(Math.random() * casts.length)],
        subcast: "Subcast-A",
        fulladdress: `House No ${100 + i}, ${village.name}`,

        // Hierarchy links
        state: village.state,
        division: village.division,
        district: village.district,
        parliament: village.parliament,
        assembly: village.assembly,
        block: village.block,
        panchayat: village.panchayat,
        village: village.id,
        booth: village.booth, // Village model stores 'booth' ref

        fallaMarjra: "Main Falia",
        voterId: `VOT${Date.now()}${i}`, // Unique Voter ID
        isActive: true,
        source: "NEW",
      });
    }

    // Optional: clear existing?
    // await Voter.deleteMany({});

    await Voter.insertMany(entries);
    console.log(`Successfully seeded ${NUMBER_OF_ENTRIES} Voters.`);
  } catch (error) {
    console.error("Error seeding Voters:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedVoters();
