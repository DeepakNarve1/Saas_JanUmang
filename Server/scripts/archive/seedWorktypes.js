require("dotenv").config();
const mongoose = require("mongoose");
const Worktype = require("./src/models/worktypeModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Worktypes...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedWorktypes = async () => {
  await connectDB();

  const dummyData = [
    "Construction",
    "Water Supply",
    "Electricity",
    "Sanitation",
    "Education",
    "Health",
    "Infrastructure Development",
    "Environmental Protection",
    "Community Outreach",
    "Social Welfare",
    "Agriculture Support",
    "Digital Literacy",
    "Emergency Relief",
    "Skill Development",
    "Women Empowerment",
    "Youth Development",
    "Heritage Conservation",
    "Road Safety",
    "Urban Planning",
    "Rural Development",
  ];

  try {
    const entries = dummyData.map((name) => ({ name }));

    // Upsert to avoid duplicates since name is unique
    let count = 0;
    for (const entry of entries) {
      await Worktype.findOneAndUpdate(
        { name: entry.name },
        { name: entry.name },
        { upsert: true, new: true },
      );
      count++;
    }

    console.log(`Successfully seeded ${count} Worktype entries.`);
  } catch (error) {
    console.error("Error seeding Worktypes:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedWorktypes();
