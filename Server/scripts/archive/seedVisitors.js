require("dotenv").config();
const mongoose = require("mongoose");
const Visitor = require("./src/models/visitorModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Visitors...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedVisitors = async () => {
  await connectDB();

  const NUMBER_OF_ENTRIES = 20;

  try {
    const districts = ["Indore", "Bhopal", "Ujjain"];
    const names = ["Visitor 1", "Guest 2", "Applicant 3", "Official 4"];
    const categories = ["VIP", "General", "Official"];
    const places = ["Office", "Residence", "Field"];

    const entries = [];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      entries.push({
        district: districts[Math.floor(Math.random() * districts.length)],
        vidhansabha: `VidhanSabha ${Math.floor(Math.random() * 5) + 1}`,
        block: `Block ${Math.floor(Math.random() * 5) + 1}`,
        name: `${names[Math.floor(Math.random() * names.length)]} - ${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        post: "Worker",
        place: places[Math.floor(Math.random() * places.length)],
        mobileNumber: `8${Math.floor(100000000 + Math.random() * 900000000)}`,
        incomingVisitor: Math.random() > 0.5 ? "INCOMING" : "VISITOR",
        message: "Meeting regarding development work",
        visitorType: "Local",
        attendBy: "PA",
        remarks: "Scheduled follow up",
        bhaiyakanirdesh: "Prioritize",
        addedBy: "Admin",
      });
    }

    await Visitor.insertMany(entries);
    console.log(`Successfully seeded ${NUMBER_OF_ENTRIES} Visitor entries.`);
  } catch (error) {
    console.error("Error seeding visitors:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedVisitors();
