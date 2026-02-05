const mongoose = require("mongoose");
const AssemblyIssue = require("./src/models/assemblyIssueModel");
require("dotenv").config();

const sampleIssues = [];

const blocks = ["Gandhwani", "Tirla", "Bagh", "Kukshi", "Manawar", "Dhar"];
const sectors = ["GANDHWANI", "BILDA", "Anjanai", "PIPLI", "ZEERABAD", "BAGH"];
const microSectors = ["GGR", "GBI", "TA", "GP", "MZ", "BG"];
const villages = [
  "Kundi",
  "Chikli",
  "Kodi",
  "Soyla",
  "Bori",
  "Pipli",
  "Rehda",
  "Jeerabad",
];
const faliyas = [
  "DavarPura",
  "Khadapura",
  "HanumanPura",
  "Baydipura",
  "Moryapura",
  "PatelPura",
];
const gramPanchayats = [
  "Rehda",
  "Chikli",
  "Pithanpur",
  "Soyla",
  "Bori",
  "Pipli",
];
const boothNames = [
  "Primary School",
  "Middle School",
  "High School",
  "Community Hall",
  "Panchayat Bhavan",
];

for (let i = 1; i <= 20000; i++) {
  const block = blocks[Math.floor(Math.random() * blocks.length)];
  const sector = sectors[Math.floor(Math.random() * sectors.length)];
  const village = villages[Math.floor(Math.random() * villages.length)];
  const faliya = faliyas[Math.floor(Math.random() * faliyas.length)];
  const gp = gramPanchayats[Math.floor(Math.random() * gramPanchayats.length)];
  const booth = boothNames[Math.floor(Math.random() * boothNames.length)];
  const msCode = microSectors[Math.floor(Math.random() * microSectors.length)];
  const msNo = `${msCode} ${Math.floor(Math.random() * 20) + 1}`;

  sampleIssues.push({
    uniqueId: `GS/${170 + i}`,
    year: Math.random() > 0.3 ? "2025" : "2024",
    acMpNo: "N/A",
    block: block,
    sector: sector,
    microSectorNo: msNo,
    microSectorName: `${sector} MS ${Math.floor(Math.random() * 10) + 1}`,
    boothName: `${booth} ${village}`,
    boothNo: (Math.floor(Math.random() * 300) + 1).toString(),
    gramPanchayat: gp,
    village: village,
    faliya: faliya,
    totalMembers: Math.floor(Math.random() * 50),
    file: "",
  });
}

async function seedAssemblyIssues() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await AssemblyIssue.deleteMany({});
    console.log("🗑️  Cleared existing assembly issues");

    // Insert new data
    const createdIssues = await AssemblyIssue.insertMany(sampleIssues);
    console.log(`✅ Created ${createdIssues.length} assembly issues`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding assembly issues:", error);
    process.exit(1);
  }
}

seedAssemblyIssues();
