require("dotenv").config();
const mongoose = require("mongoose");
const DispatchRegister = require("./src/models/dispatchRegisterModel");
const Department = require("./src/models/departmentModel");
const District = require("./src/models/districtModel");
const Block = require("./src/models/blockModel");
const Panchayat = require("./src/models/panchayatModel");
const Village = require("./src/models/villageModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Dispatch Register...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedDispatchRegister = async () => {
  await connectDB();

  const NUMBER_OF_ENTRIES = 20;

  try {
    // Fetch master data
    const departments = await Department.find().limit(5);
    const districts = await District.find().limit(5);
    const blocks = await Block.find().limit(5);
    const panchayats = await Panchayat.find().limit(5);
    const villages = await Village.find().limit(5);

    // Ensure departments exist
    let finalDepartments = departments;
    if (finalDepartments.length === 0) {
      const deptNames = ["HR", "Finance", "Public Works"];
      finalDepartments = await Department.insertMany(
        deptNames.map((name) => ({ name })),
      );
    }

    const entries = [];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      const date = new Date(
        Date.now() - Math.floor(Math.random() * 10000000000),
      );
      const district =
        districts.length > 0
          ? districts[Math.floor(Math.random() * districts.length)]
          : null;
      const block =
        blocks.length > 0
          ? blocks[Math.floor(Math.random() * blocks.length)]
          : null;
      const panchayat =
        panchayats.length > 0
          ? panchayats[Math.floor(Math.random() * panchayats.length)]
          : null;
      const village =
        villages.length > 0
          ? villages[Math.floor(Math.random() * villages.length)]
          : null;
      const dept =
        finalDepartments.length > 0
          ? finalDepartments[
              Math.floor(Math.random() * finalDepartments.length)
            ]
          : null;

      entries.push({
        date: date,
        year: date.getFullYear().toString(),
        month: months[date.getMonth()],
        dispatchNo: `DR-${date.getFullYear()}-${1000 + i}`,
        department: dept ? dept._id : null,
        district: district ? district._id : null,
        block: block ? block._id : null,
        panchayat: panchayat ? [panchayat._id] : [],
        village: village ? [village._id] : [],
        portalNo: `PORTAL-${Math.floor(Math.random() * 1000)}`,
        samitiNo: `SAMITI-${Math.floor(Math.random() * 100)}`,
        particulars: "Dispatch regarding urgent matters.",
        reference: `REF-${Math.floor(Math.random() * 500)}`,
      });
    }

    await DispatchRegister.insertMany(entries);
    console.log(
      `Successfully seeded ${NUMBER_OF_ENTRIES} Dispatch Register entries.`,
    );
  } catch (error) {
    console.error("Error seeding Dispatch Register:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedDispatchRegister();
