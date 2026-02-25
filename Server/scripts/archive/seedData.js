const mongoose = require("mongoose");
const State = require("./src/models/stateModel");
const Division = require("./src/models/divisionModel");
const District = require("./src/models/districtModel");
const Parliament = require("./src/models/parliamentModel");
const Assembly = require("./src/models/assemblyModel");
const Block = require("./src/models/blockModel");
const Booth = require("./src/models/boothModel");
require("dotenv").config();

const states = [
  { name: "Madhya Pradesh" },
  { name: "Uttar Pradesh" },
  { name: "Maharashtra" },
  { name: "Gujarat" },
  { name: "Rajasthan" },
  { name: "Karnataka" },
  { name: "Tamil Nadu" },
];

const divisionsWithState = [
  { name: "Bhopal", state: "Madhya Pradesh" },
  { name: "Indore", state: "Madhya Pradesh" },
  { name: "Gwalior", state: "Madhya Pradesh" },
  { name: "Jabalpur", state: "Madhya Pradesh" },
  { name: "Ujjain", state: "Madhya Pradesh" },
  { name: "Sagar", state: "Madhya Pradesh" },
  { name: "Chambal", state: "Madhya Pradesh" },
  { name: "Narmadapuram", state: "Madhya Pradesh" },
  { name: "Shahdol", state: "Madhya Pradesh" },
  { name: "Rewa", state: "Madhya Pradesh" },
  { name: "Lucknow", state: "Uttar Pradesh" },
];

const districtsWithDivision = [
  // Bhopal Division
  { name: "Bhopal", division: "Bhopal" },
  { name: "Raisen", division: "Bhopal" },
  { name: "Rajgarh", division: "Bhopal" },
  { name: "Sehore", division: "Bhopal" },
  { name: "Vidisha", division: "Bhopal" },
  // Indore Division
  { name: "Indore", division: "Indore" },
  { name: "Dhar", division: "Indore" },
  { name: "Jhabua", division: "Indore" },
  { name: "Khargone", division: "Indore" }, // West Nimar
  { name: "Khandwa", division: "Indore" }, // East Nimar
  // Gwalior Division
  { name: "Gwalior", division: "Gwalior" },
  { name: "Shivpuri", division: "Gwalior" },
  { name: "Guna", division: "Gwalior" },
  { name: "Ashoknagar", division: "Gwalior" },
  { name: "Datia", division: "Gwalior" },
  // Jabalpur Division
  { name: "Jabalpur", division: "Jabalpur" },
  { name: "Katni", division: "Jabalpur" },
  { name: "Narsinghpur", division: "Jabalpur" },
  { name: "Seoni", division: "Jabalpur" },
  { name: "Chhindwara", division: "Jabalpur" },
  // Ujjain Division
  { name: "Ujjain", division: "Ujjain" },
  { name: "Dewas", division: "Ujjain" },
  { name: "Ratlam", division: "Ujjain" },
  { name: "Shajapur", division: "Ujjain" },
  { name: "Agar Malwa", division: "Ujjain" },
  // Sagar Division
  { name: "Sagar", division: "Sagar" },
  { name: "Damoh", division: "Sagar" },
  { name: "Panna", division: "Sagar" },
  { name: "Chhatarpur", division: "Sagar" },
  { name: "Tikamgarh", division: "Sagar" },
  // Chambal Division
  { name: "Morena", division: "Chambal" },
  { name: "Sheopur", division: "Chambal" },
  { name: "Bhind", division: "Chambal" },
  // Narmadapuram Division
  { name: "Narmadapuram", division: "Narmadapuram" }, // Hoshangabad
  { name: "Betul", division: "Narmadapuram" },
  { name: "Harda", division: "Narmadapuram" },
  // Shahdol Division
  { name: "Shahdol", division: "Shahdol" },
  { name: "Umaria", division: "Shahdol" },
  { name: "Anuppur", division: "Shahdol" },
  // Rewa Division
  { name: "Rewa", division: "Rewa" },
  { name: "Satna", division: "Rewa" },
  { name: "Sidhi", division: "Rewa" },
  { name: "Singrauli", division: "Rewa" },
  // Lucknow Division
  { name: "Lucknow", division: "Lucknow" },
];

const parliamentsWithDivision = [
  // Bhopal Division
  { name: "Bhopal", division: "Bhopal" },
  { name: "Vidisha", division: "Bhopal" },
  { name: "Rajgarh", division: "Bhopal" },
  // Indore Division
  { name: "Indore", division: "Indore" },
  { name: "Dhar", division: "Indore" },
  { name: "Khandwa", division: "Indore" },
  { name: "Khargone", division: "Indore" },
  { name: "Ratlam", division: "Ujjain" },
  // Gwalior Division
  { name: "Gwalior", division: "Gwalior" },
  { name: "Guna", division: "Gwalior" },
  { name: "Morena", division: "Chambal" },
  { name: "Bhind", division: "Chambal" },
  // Jabalpur Division
  { name: "Jabalpur", division: "Jabalpur" },
  { name: "Balaghat", division: "Jabalpur" },
  { name: "Chhindwara", division: "Jabalpur" },
  { name: "Mandla", division: "Jabalpur" },
  // Ujjain Division
  { name: "Ujjain", division: "Ujjain" },
  { name: "Dewas", division: "Ujjain" },
  { name: "Mandsaur", division: "Ujjain" },
  // Sagar Division
  { name: "Sagar", division: "Sagar" },
  { name: "Damoh", division: "Sagar" },
  { name: "Khajuraho", division: "Sagar" },
  { name: "Tikamgarh", division: "Sagar" },
  // Rewa Division
  { name: "Rewa", division: "Rewa" },
  { name: "Satna", division: "Rewa" },
  { name: "Sidhi", division: "Rewa" },
  // Shahdol Division
  { name: "Shahdol", division: "Shahdol" },
  // Narmadapuram
  { name: "Hoshangabad", division: "Narmadapuram" },
  { name: "Betul", division: "Narmadapuram" },
];

const assembliesWithParliament = [
  // Bhopal Parliament
  { name: "Berasia", parliament: "Bhopal" },
  { name: "Bhopal Uttar", parliament: "Bhopal" },
  { name: "Bhopal Dakshin-Paschim", parliament: "Bhopal" },
  { name: "Bhopal Madhya", parliament: "Bhopal" },
  { name: "Govindpura", parliament: "Bhopal" },
  { name: "Huzur", parliament: "Bhopal" },
  // Indore Parliament
  { name: "Depalpur", parliament: "Indore" },
  { name: "Indore-1", parliament: "Indore" },
  { name: "Indore-2", parliament: "Indore" },
  { name: "Indore-3", parliament: "Indore" },
  { name: "Indore-4", parliament: "Indore" },
  { name: "Indore-5", parliament: "Indore" },
  { name: "Mhow", parliament: "Indore" },
  { name: "Rau", parliament: "Indore" },
  { name: "Sanwer", parliament: "Indore" },
];

const blocksWithAssembly = [
  // Berasia Assembly
  { name: "Berasia Block 1", assembly: "Berasia" },
  { name: "Berasia Block 2", assembly: "Berasia" },
  // Govindpura Assembly
  { name: "Govindpura Block A", assembly: "Govindpura" },
  { name: "Govindpura Block B", assembly: "Govindpura" },
  // Indore-1 Assembly
  { name: "Indore-1 Block X", assembly: "Indore-1" },
  { name: "Indore-1 Block Y", assembly: "Indore-1" },
];

const boothsWithBlock = [
  { name: "Booth 1", code: "B001", block: "Berasia Block 1" },
  { name: "Booth 2", code: "B002", block: "Berasia Block 1" },
  { name: "Booth 10", code: "B010", block: "Govindpura Block A" },
  { name: "Booth 11", code: "B011", block: "Govindpura Block A" },
  { name: "Booth 50", code: "B050", block: "Indore-1 Block X" },
];

async function seedData() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in .env file");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await State.deleteMany({});
    console.log("🗑️  Cleared existing states");

    await Division.deleteMany({});
    console.log("🗑️  Cleared existing divisions");

    await District.deleteMany({});
    console.log("🗑️  Cleared existing districts");

    await Parliament.deleteMany({});
    console.log("🗑️  Cleared existing parliaments");

    await Assembly.deleteMany({});
    console.log("🗑️  Cleared existing assemblies");

    await Block.deleteMany({});
    console.log("🗑️  Cleared existing blocks");

    await Booth.deleteMany({});
    console.log("🗑️  Cleared existing booths");

    // Insert new data
    const createdStates = await State.insertMany(states);
    console.log(`✅ Created ${createdStates.length} states`);

    // Creates State Map
    const stateMap = {};
    createdStates.forEach((st) => {
      stateMap[st.name] = st._id;
    });

    const divisionsToInsert = divisionsWithState.map((d) => {
      const stateId = stateMap[d.state];
      if (!stateId) {
        console.warn(`⚠️ State not found for division: ${d.name} (${d.state})`);
      }
      return {
        name: d.name,
        state: stateId,
      };
    });

    const createdDivisions = await Division.insertMany(divisionsToInsert);
    console.log(`✅ Created ${createdDivisions.length} divisions`);

    // Create a map of division name to ID
    const divisionMap = {};
    createdDivisions.forEach((div) => {
      divisionMap[div.name] = div._id;
    });

    const districtsToInsert = districtsWithDivision.map((d) => {
      const divisionId = divisionMap[d.division];
      if (!divisionId) {
        console.warn(
          `⚠️ Division not found for district: ${d.name} (${d.division})`
        );
      }
      return {
        name: d.name,
        division: divisionId,
      };
    });

    const createdDistricts = await District.insertMany(districtsToInsert);
    console.log(`✅ Created ${createdDistricts.length} districts`);

    const parliamentsToInsert = parliamentsWithDivision.map((p) => {
      const divisionId = divisionMap[p.division];
      if (!divisionId) {
        console.warn(
          `⚠️ Division not found for parliament: ${p.name} (${p.division})`
        );
      }
      return {
        name: p.name,
        division: divisionId,
      };
    });

    const createdParliaments = await Parliament.insertMany(parliamentsToInsert);
    console.log(`✅ Created ${createdParliaments.length} parliaments`);

    // Creates Parliament Map
    const parliamentMap = {};
    createdParliaments.forEach((par) => {
      parliamentMap[par.name] = par._id;
    });

    const assembliesToInsert = assembliesWithParliament
      .map((a) => {
        const parliamentId = parliamentMap[a.parliament];
        if (!parliamentId) return null;
        return { name: a.name, parliament: parliamentId };
      })
      .filter((a) => a !== null);

    const createdAssemblies = await Assembly.insertMany(assembliesToInsert);
    console.log(`✅ Created ${createdAssemblies.length} assemblies`);

    // Creates Assembly Map
    const assemblyMap = {};
    createdAssemblies.forEach((asm) => {
      assemblyMap[asm.name] = asm._id;
    });

    const blocksToInsert = blocksWithAssembly
      .map((b) => {
        const assemblyId = assemblyMap[b.assembly];
        if (!assemblyId) return null;
        return { name: b.name, assembly: assemblyId };
      })
      .filter((b) => b !== null);

    const createdBlocks = await Block.insertMany(blocksToInsert);
    console.log(`✅ Created ${createdBlocks.length} blocks`);

    // Creates Block Map
    const blockMap = {};
    createdBlocks.forEach((blk) => {
      blockMap[blk.name] = blk._id;
    });

    const boothsToInsert = boothsWithBlock
      .map((b) => {
        const blockId = blockMap[b.block];
        if (!blockId) return null;
        return { name: b.name, code: b.code, block: blockId };
      })
      .filter((b) => b !== null);

    const createdBooths = await Booth.insertMany(boothsToInsert);
    console.log(`✅ Created ${createdBooths.length} booths`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedData();
