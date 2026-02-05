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

  const NUMBER_OF_ENTRIES = 50;

  try {
    const districts = ["Indore", "Bhopal", "Ujjain", "Dewas", "Ratlam"];
    const commonNames = [
      "Rahul Sharma",
      "Amit Patel",
      "Sanjay Gupta",
      "Vijay Singh",
      "Anjali Verma",
      "Priya Singh",
      "Deepak Kumar",
      "Sunil Mehta",
      "Kavita Jain",
      "Anita Deshmukh",
      "Rajesh Rathore",
      "Suresh Pal",
    ];
    const categories = [
      "VIP",
      "General",
      "Political Leader",
      "Worker",
      "Common Man",
    ];
    const places = [
      "Main Office",
      "Home Residence",
      "Public Square",
      "Community Hall",
    ];

    // As per requirement: standardized to 'General Visitor' and 'Problem'
    const visitorTypes = ["General Visitor", "Problem"];

    const entries = [];
    const now = new Date();

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      const randomDate = new Date(
        now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      );

      entries.push({
        district: districts[Math.floor(Math.random() * districts.length)],
        vidhansabha: `VidhanSabha ${Math.floor(Math.random() * 10) + 1}`,
        block: `Block ${Math.floor(Math.random() * 10) + 1}`,
        date: randomDate.toISOString().split("T")[0],
        time: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(
          Math.random() * 60,
        )
          .toString()
          .padStart(2, "0")} ${Math.random() > 0.5 ? "AM" : "PM"}`,
        name: commonNames[Math.floor(Math.random() * commonNames.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        post: i % 3 === 0 ? "President" : i % 2 === 0 ? "Member" : "Worker",
        place: places[Math.floor(Math.random() * places.length)],
        mobileNumber: `${Math.floor(7000000000 + Math.random() * 3000000000)}`,
        incomingVisitor: Math.random() > 0.5 ? "INCOMING" : "VISITOR",
        message:
          i % 2 === 0
            ? "Regarding road construction in our ward."
            : "Inquiry about new government schemes.",
        visitorType:
          visitorTypes[Math.floor(Math.random() * visitorTypes.length)],
        attendBy: "Staff Member " + (Math.floor(Math.random() * 3) + 1),
        remarks: "Need to follow up in 2 days.",
        bhaiyakanirdesh: "Check possibility and report back.",
        addedBy: "Admin System",
      });
    }

    console.log("Cleaning existing visitors...");
    await Visitor.deleteMany({}); // Clear all existing visitor data

    await Visitor.insertMany(entries);
    console.log(
      `\x1b[32mSuccessfully seeded ${NUMBER_OF_ENTRIES} Visitor entries.\x1b[0m`,
    );
  } catch (error) {
    console.error("\x1b[31mError seeding visitors:\x1b[0m", error);
  } finally {
    mongoose.connection.close();
  }
};

seedVisitors();
