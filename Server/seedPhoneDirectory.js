require("dotenv").config();
const mongoose = require("mongoose");
const PhoneDirectory = require("./src/models/phoneDirectoryModel");
const Department = require("./src/models/departmentModel");
const Party = require("./src/models/partyModel");
const District = require("./src/models/districtModel");
const Block = require("./src/models/blockModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Phone Directory...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedPhoneDirectory = async () => {
  await connectDB();

  const NUMBER_OF_ENTRIES = 20;

  try {
    // Fetch some master data to link
    const departments = await Department.find().limit(5);
    const parties = await Party.find().limit(5);
    const districts = await District.find().limit(5);
    const blocks = await Block.find().limit(5);

    // If master data is missing, we will create some dummy ObjectIds or just skip fields
    // ideally the user has run seedMasterData.js, so districts/blocks exist.
    // If Departments/Parties are empty, we might insert a few dummies first if we really want to be robust,
    // or just proceed with nulls if empty.

    // Let's quickly seed dummy departments/parties if they don't exist, just in case.
    let finalDepartments = departments;
    if (finalDepartments.length === 0) {
      // Create a few dummy departments
      const deptNames = ["HR", "Finance", "IT", "Admin", "Public Works"];
      finalDepartments = await Department.insertMany(
        deptNames.map((name) => ({ name })),
      );
      console.log("Created dummy departments.");
    }

    let finalParties = parties;
    if (finalParties.length === 0) {
      // Create a few dummy parties
      const partyNames = ["Party A", "Party B", "Party C"];
      finalParties = await Party.insertMany(
        partyNames.map((name) => ({ name })),
      );
      console.log("Created dummy parties.");
    }

    const entries = [];
    const names = [
      "Amit Patel",
      "Sneha Gupta",
      "Rahul Singh",
      "Priya Sharma",
      "Vikram Verma",
    ];
    const posts = ["Manager", "Clerk", "Officer", "Assistant", "Director"];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const post = posts[Math.floor(Math.random() * posts.length)];

      const dept =
        finalDepartments.length > 0
          ? finalDepartments[
              Math.floor(Math.random() * finalDepartments.length)
            ]
          : null;
      const party =
        finalParties.length > 0
          ? finalParties[Math.floor(Math.random() * finalParties.length)]
          : null;
      const district =
        districts.length > 0
          ? districts[Math.floor(Math.random() * districts.length)]
          : null;
      const block =
        blocks.length > 0
          ? blocks[Math.floor(Math.random() * blocks.length)]
          : null;

      entries.push({
        name: `${name} ${i + 1}`,
        post: post,
        department: dept ? dept._id : null,
        district: district ? district._id : null,
        block: block ? block._id : null,
        party: party ? party._id : null,
        number: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        alternateNumber: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
        email: `user${i}@example.com`,
        remark: "Auto Generated Entry",
        status: Math.random() > 0.2 ? "Active" : "Inactive",
      });
    }

    await PhoneDirectory.insertMany(entries);
    console.log(
      `Successfully seeded ${NUMBER_OF_ENTRIES} Phone Directory entries.`,
    );
  } catch (error) {
    console.error("Error seeding Phone Directory:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedPhoneDirectory();
