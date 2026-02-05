require("dotenv").config();
const mongoose = require("mongoose");
const CallManagement = require("./src/models/callManagementModel");
const User = require("./src/models/userModel"); // Helper to get a valid user ID

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Call Management...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedCallManagement = async () => {
  await connectDB();

  const NUMBER_OF_ENTRIES = 20;

  try {
    // We need a valid user ID for 'addedBy'
    const user = await User.findOne();
    if (!user) {
      console.error("No user found! Please register a user first.");
      process.exit(1);
    }

    const categories = ["Appointment", "Samsya", "General"];
    const names = [
      "Ramesh Kumar",
      "Suresh Singh",
      "Anita Devi",
      "Geeta Sharma",
      "Mohan Lal",
    ];
    const subjects = [
      "Water Problem",
      "Road Repair",
      "Electricity Bill",
      "School Admission",
      "Job Request",
    ];

    const entries = [];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      const randDate = new Date();
      randDate.setDate(randDate.getDate() - Math.floor(Math.random() * 10));

      entries.push({
        date: randDate,
        category: categories[Math.floor(Math.random() * categories.length)],
        name: names[Math.floor(Math.random() * names.length)],
        mobile: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        assignDate: new Date(),
        address: `Village ${i + 1}, Block Example`,
        description: `Description for entry ${i + 1}`,
        remark: "Pending review",
        addedBy: user._id,
      });
    }

    await CallManagement.insertMany(entries);
    console.log(
      `Successfully seeded ${NUMBER_OF_ENTRIES} Call Management entries.`,
    );
  } catch (error) {
    console.error("Error seeding calls:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedCallManagement();
