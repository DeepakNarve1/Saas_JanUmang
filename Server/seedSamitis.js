require("dotenv").config();
const mongoose = require("mongoose");
const getSamitiModel = require("./src/models/vidhanSabhasamitiModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Samitis...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedSamitis = async () => {
  await connectDB();

  const samitiTypes = [
    "ganesh-samiti",
    "tenkar-samiti",
    "dp-samiti",
    "mandir-samiti",
    "bhagoria-samiti",
    "nirman-samiti",
    "booth-samiti",
    "block-samiti",
  ];

  const NUMBER_OF_ENTRIES_PER_TYPE = 20;

  try {
    for (const type of samitiTypes) {
      console.log(`Seeding ${type}...`);
      const Model = getSamitiModel(type);
      const entries = [];

      for (let i = 0; i < NUMBER_OF_ENTRIES_PER_TYPE; i++) {
        entries.push({
          samitiType: type,
          uniqueId: `${type.substring(0, 2).toUpperCase()}-${Date.now()}-${i}`,
          year: "2024",
          block: "Test Block",
          gramPanchayat: "Test GP",
          village: `Test Village ${i}`,
          faliya: "Main Faliya",
          image: "", // Optional
          // Bhagoria specific fields (will just be ignored by others if schema strict is true, but handled by mixed schema)
          date: new Date().toISOString().split("T")[0],
          day: "Monday",
          bhagoriaHat: "Test Hat",
          inChargeName: "Test Incharge",
          mobileNumber: "9876543210",
          remark: "Auto Generated",
        });
      }
      await Model.insertMany(entries);
      console.log(`  Added ${NUMBER_OF_ENTRIES_PER_TYPE} to ${type}`);
    }

    console.log("All Samiti modules seeded successfully.");
  } catch (error) {
    console.error("Error seeding samitis:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedSamitis();
