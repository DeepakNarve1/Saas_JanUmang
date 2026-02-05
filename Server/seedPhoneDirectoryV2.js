require("dotenv").config();
const mongoose = require("mongoose");
const PhoneDirectory = require("./src/models/phoneDirectoryModel");
const Department = require("./src/models/departmentModel");
const Party = require("./src/models/partyModel");
const District = require("./src/models/districtModel");
const Block = require("./src/models/blockModel");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const departmentsData = [
  "Police",
  "Revenue",
  "Education",
  "Health",
  "Agriculture",
  "PWD",
  "Irrigation",
  "Forest",
  "Transportation",
  "Electricity Board",
];

const partiesData = [
  "BJP",
  "INC",
  "AAP",
  "BSP",
  "SP",
  "NCP",
  "Shiv Sena",
  "Independent",
];

const phoneEntries = [
  {
    name: "Rajesh Kumar",
    post: "Superintendent of Police",
    department: "Police",
    number: "9876543210",
    email: "rajesh.police@example.com",
  },
  {
    name: "Anjali Sharma",
    post: "Collector",
    department: "Revenue",
    number: "9876543211",
    email: "anjali.collector@example.com",
  },
  {
    name: "Suresh Meena",
    post: "District Education Officer",
    department: "Education",
    number: "9876543212",
    email: "suresh.edu@example.com",
  },
  {
    name: "Dr. Vinay Gupta",
    post: "Chief Medical Officer",
    department: "Health",
    number: "9876543213",
    email: "vinay.health@example.com",
  },
  {
    name: "Mahendra Singh",
    post: "Executive Engineer",
    department: "PWD",
    number: "9876543214",
    email: "mahendra.pwd@example.com",
  },
  {
    name: "Sunita Yadav",
    post: "Tehsildar",
    department: "Revenue",
    number: "9876543215",
    email: "sunita.rev@example.com",
  },
  {
    name: "Pankaj Tiwari",
    post: "Station House Officer",
    department: "Police",
    number: "9876543216",
    email: "pankaj.sho@example.com",
  },
  {
    name: "Vikram Rathore",
    post: "Forest Range Officer",
    department: "Forest",
    number: "9876543217",
    email: "vikram.forest@example.com",
  },
  {
    name: "Deepak Chaurasia",
    post: "RTO Officer",
    department: "Transportation",
    number: "9876543218",
    email: "deepak.rto@example.com",
  },
  {
    name: "Ramesh Jain",
    post: "Assistant Engineer",
    department: "Irrigation",
    number: "9876543219",
    email: "ramesh.irr@example.com",
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log("Cleaning old data...");
    // We only clean Phone Directory, but we might keep or update Departments/Parties
    await PhoneDirectory.deleteMany({});

    // Ensure Departments exist
    const deptMap = {};
    for (const name of departmentsData) {
      let dept = await Department.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
      });
      if (!dept) {
        dept = await Department.create({ name });
        console.log(`Created Department: ${name}`);
      }
      deptMap[name.toLowerCase()] = dept._id;
    }

    // Ensure Parties exist
    const partyMap = {};
    for (const name of partiesData) {
      let party = await Party.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
      });
      if (!party) {
        party = await Party.create({ name });
        console.log(`Created Party: ${name}`);
      }
      partyMap[name.toLowerCase()] = party._id;
    }

    // Fetch existing District and Block if any (just pick one for variety)
    const district = await District.findOne();
    const block = await Block.findOne();

    const finalEntries = [];

    // Add specific predefined entries
    for (const entry of phoneEntries) {
      finalEntries.push({
        ...entry,
        department: deptMap[entry.department.toLowerCase()],
        party: partyMap["independent"], // Default to independent or random
        district: district ? district._id : undefined,
        block: block ? block._id : undefined,
        status: "Active",
      });
    }

    // Add some random entries to make it 50
    const roles = [
      "Officer",
      "Clerk",
      "Manager",
      "Assistant",
      "Supervisor",
      "Coordinator",
    ];
    for (let i = 0; i < 40; i++) {
      const randomDept =
        departmentsData[Math.floor(Math.random() * departmentsData.length)];
      const randomParty =
        partiesData[Math.floor(Math.random() * partiesData.length)];
      const randomRole = roles[Math.floor(Math.random() * roles.length)];

      finalEntries.push({
        name: `Staff Member ${i + 1}`,
        post: `${randomRole} (${randomDept})`,
        department: deptMap[randomDept.toLowerCase()],
        party: partyMap[randomParty.toLowerCase()],
        district: district ? district._id : undefined,
        block: block ? block._id : undefined,
        number: `90000${Math.floor(10000 + Math.random() * 90000)}`,
        email: `staff${i + 1}@example.com`,
        status: Math.random() > 0.1 ? "Active" : "Inactive",
      });
    }

    await PhoneDirectory.insertMany(finalEntries);
    console.log(
      `Successfully seeded ${finalEntries.length} Phone Directory entries!`,
    );

    process.exit();
  } catch (error) {
    console.error(`Error with seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
