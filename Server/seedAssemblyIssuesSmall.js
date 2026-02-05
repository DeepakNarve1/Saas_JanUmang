require("dotenv").config();
const mongoose = require("mongoose");
const AssemblyIssue = require("./src/models/assemblyIssueModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(
      "MongoDB Connected for Seeding Assembly Issues (Small Batch)...",
    );
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedAssemblyIssuesSmall = async () => {
  await connectDB();

  const NUMBER_OF_ENTRIES = 20;

  try {
    const blocks = ["Gandhwani", "Tirla", "Bagh"];
    const entries = [];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      entries.push({
        uniqueId: `AI-SMALL-${Date.now()}-${i}`,
        year: "2024",
        acMpNo: "123",
        block: blocks[Math.floor(Math.random() * blocks.length)],
        sector: "Sector A",
        microSectorNo: "M-1",
        microSectorName: "Micro A",
        boothName: "Booth X",
        boothNo: `${i + 1}`,
        gramPanchayat: "GP Test",
        village: `Village ${i}`,
        faliya: "Faliya Z",
        totalMembers: Math.floor(Math.random() * 50) + 1,
        file: "",
      });
    }

    await AssemblyIssue.insertMany(entries);
    console.log(`Successfully seeded ${NUMBER_OF_ENTRIES} Assembly Issues.`);
  } catch (error) {
    console.error("Error seeding assembly issues:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedAssemblyIssuesSmall();
