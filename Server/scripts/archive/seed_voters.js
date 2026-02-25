require("dotenv").config();
const mongoose = require("mongoose");
const Voter = require("./src/models/voterModel");
const Block = require("./src/models/blockModel");
const Panchayat = require("./src/models/panchayatModel");
const Village = require("./src/models/villageModel");
const Booth = require("./src/models/boothModel");
const State = require("./src/models/stateModel");
const Division = require("./src/models/divisionModel");
const District = require("./src/models/districtModel");
const Parliament = require("./src/models/parliamentModel");
const Assembly = require("./src/models/assemblyModel");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/adminlte";

// Sample data arrays
const firstNames = [
  "Rajesh",
  "Priya",
  "Amit",
  "Sunita",
  "Vikram",
  "Anjali",
  "Suresh",
  "Kavita",
  "Ramesh",
  "Pooja",
  "Anil",
  "Deepa",
  "Manoj",
  "Rekha",
  "Sanjay",
  "Meera",
  "Ashok",
  "Geeta",
  "Dinesh",
  "Savita",
  "Ravi",
  "Nisha",
  "Prakash",
  "Usha",
  "Vijay",
  "Asha",
  "Mohan",
  "Lata",
  "Naresh",
  "Kiran",
  "Rajendra",
  "Manju",
  "Santosh",
  "Sarita",
  "Mahesh",
  "Anita",
  "Pankaj",
  "Suman",
  "Ajay",
  "Neha",
  "Rajeev",
  "Shobha",
  "Sunil",
  "Vandana",
  "Arun",
  "Poonam",
  "Mukesh",
  "Ritu",
  "Yogesh",
  "Seema",
];

const fatherNames = [
  "Ram Singh",
  "Shyam Lal",
  "Mohan Das",
  "Hari Prasad",
  "Gopal Sharma",
  "Krishna Kumar",
  "Babu Lal",
  "Ratan Singh",
  "Jagdish Prasad",
  "Balram Yadav",
  "Ganesh Verma",
  "Lakshman Patel",
  "Narayan Gupta",
  "Bharat Singh",
  "Arjun Kumar",
  "Hanuman Das",
  "Keshav Lal",
  "Madhav Sharma",
  "Radhey Shyam",
  "Govind Prasad",
];

const casts = ["General", "OBC", "SC", "ST"];
const subcasts = [
  "Brahmin",
  "Yadav",
  "Patel",
  "Rajput",
  "Chamar",
  "Meena",
  "Gond",
  "Bhil",
];

const addresses = [
  "Ward No 1, Main Road",
  "Ward No 2, Station Road",
  "Ward No 3, Gandhi Chowk",
  "Ward No 4, Nehru Nagar",
  "Ward No 5, Ambedkar Colony",
  "Ward No 6, Indira Nagar",
  "Ward No 7, Rajiv Gandhi Ward",
  "Ward No 8, Sardar Patel Nagar",
  "Ward No 9, Subhash Nagar",
  "Ward No 10, Tilak Nagar",
];

const fallaMarjraOptions = [
  "Falla A",
  "Falla B",
  "Falla C",
  "Marjra 1",
  "Marjra 2",
  "Marjra 3",
];

// Helper function to get random item from array
const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper function to generate random mobile number
const generateMobile = () => {
  const prefixes = ["98", "99", "97", "96", "95", "94", "93", "92", "91", "90"];
  return `${getRandomItem(prefixes)}${Math.floor(10000000 + Math.random() * 90000000)}`;
};

// Helper function to generate voter ID
const generateVoterId = (index) => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const prefix =
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)] +
    letters[Math.floor(Math.random() * 26)];
  const number = String(1000000 + index).slice(-7);
  return `${prefix}${number}`;
};

async function seedVoters() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing voters
    console.log("🗑️  Clearing existing voter data...");
    await Voter.deleteMany({});
    console.log("✅ Cleared existing voters");

    // Fetch required reference data
    console.log("📥 Fetching reference data...");
    const states = await State.find().limit(1);
    const divisions = await Division.find().limit(1);
    const districts = await District.find().limit(1);
    const parliaments = await Parliament.find().limit(1);
    const assemblies = await Assembly.find().limit(1);
    const blocks = await Block.find().limit(5);
    const panchayats = await Panchayat.find().limit(10);
    const villages = await Village.find().limit(20);
    const booths = await Booth.find().limit(30);

    if (
      !states.length ||
      !divisions.length ||
      !districts.length ||
      !parliaments.length ||
      !assemblies.length ||
      !blocks.length ||
      !panchayats.length ||
      !villages.length ||
      !booths.length
    ) {
      console.error(
        "❌ Missing required reference data. Please ensure you have:",
      );
      console.error("   - At least 1 State");
      console.error("   - At least 1 Division");
      console.error("   - At least 1 District");
      console.error("   - At least 1 Parliament");
      console.error("   - At least 1 Assembly");
      console.error("   - At least 5 Blocks");
      console.error("   - At least 10 Panchayats");
      console.error("   - At least 20 Villages");
      console.error("   - At least 30 Booths");
      process.exit(1);
    }

    console.log("✅ Reference data loaded");
    console.log(`   States: ${states.length}`);
    console.log(`   Divisions: ${divisions.length}`);
    console.log(`   Districts: ${districts.length}`);
    console.log(`   Parliaments: ${parliaments.length}`);
    console.log(`   Assemblies: ${assemblies.length}`);
    console.log(`   Blocks: ${blocks.length}`);
    console.log(`   Panchayats: ${panchayats.length}`);
    console.log(`   Villages: ${villages.length}`);
    console.log(`   Booths: ${booths.length}`);

    // Generate voters
    console.log("\n📝 Generating 100 voter records...");
    const voters = [];

    for (let i = 0; i < 100; i++) {
      const voter = {
        name:
          getRandomItem(firstNames) +
          " " +
          getRandomItem(fatherNames).split(" ")[0],
        fatherName: getRandomItem(fatherNames),
        mobileNumber: generateMobile(),
        age: Math.floor(18 + Math.random() * 62), // Age between 18-80
        cast: getRandomItem(casts),
        subcast: getRandomItem(subcasts),
        fulladdress: getRandomItem(addresses),
        state: states[0]._id,
        division: divisions[0]._id,
        district: districts[0]._id,
        parliament: parliaments[0]._id,
        assembly: assemblies[0]._id,
        block: getRandomItem(blocks)._id,
        panchayat: getRandomItem(panchayats)._id,
        village: getRandomItem(villages)._id,
        booth: getRandomItem(booths)._id,
        boothno: String(Math.floor(1 + Math.random() * 300)),
        fallaMarjra: getRandomItem(fallaMarjraOptions),
        voterId: generateVoterId(i),
        isActive: true,
        source: "NEW",
      };

      voters.push(voter);

      // Progress indicator
      if ((i + 1) % 20 === 0) {
        console.log(`   Generated ${i + 1}/100 voters...`);
      }
    }

    console.log("\n💾 Inserting voters into database...");
    await Voter.insertMany(voters);
    console.log(`✅ Successfully inserted ${voters.length} voters`);

    // Show summary
    console.log("\n📊 Summary:");
    console.log(`   Total voters created: ${voters.length}`);
    console.log(`   Blocks covered: ${blocks.length}`);
    console.log(`   Panchayats covered: ${panchayats.length}`);
    console.log(`   Villages covered: ${villages.length}`);
    console.log(`   Booths covered: ${booths.length}`);

    console.log("\n✨ Voter seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding voters:", error);
    process.exit(1);
  }
}

// Run the seeder
seedVoters();
