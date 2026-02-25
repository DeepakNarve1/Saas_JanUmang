require("dotenv").config();
const mongoose = require("mongoose");
const SubTypeOfWork = require("./src/models/subtypeOfWorkModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Sub Type of Work...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedSubTypeOfWork = async () => {
  await connectDB();

  const dummyData = [
    {
      typeOfWork: "Construction",
      subTypes: ["Road", "Building", "Bridge", "Drainage", "Boundary Wall"],
    },
    {
      typeOfWork: "Water Supply",
      subTypes: ["Pipeline", "Handpump", "Water Tank", "Tube Well"],
    },
    {
      typeOfWork: "Electricity",
      subTypes: ["Transformer", "Pole Installation", "Wiring", "Solar Lights"],
    },
    {
      typeOfWork: "Sanitation",
      subTypes: ["Toilet Construction", "Waste Management", "Cleaning Drive"],
    },
    {
      typeOfWork: "Education",
      subTypes: ["School Renovation", "Library", "Smart Class Setup"],
    },
    {
      typeOfWork: "Health",
      subTypes: ["Dispensary", "Vaccination Camp", "Ambulance Service"],
    },
  ];

  try {
    const entries = [];

    for (const group of dummyData) {
      for (const subType of group.subTypes) {
        entries.push({
          typeOfWork: group.typeOfWork,
          subTypeOfWork: subType,
        });
      }
    }

    // Add some random duplicates or extra ones to reach count if needed, but distinct list is usually better for this master data.
    // The user asked for 20 entries. The above yields  5+4+4+3+3+3 = 22 entries. Perfect.

    // Optional: Clear existing unique combinations if you want to avoid clutter or multiple same-name entries?
    // Since schema doesn't force unique compound index (based on the file view), duplicates could happen.
    // I'll delete existing for a clean seed of this specific collection.
    await SubTypeOfWork.deleteMany({});
    console.log("Cleared existing SubTypeOfWork records.");

    await SubTypeOfWork.insertMany(entries);
    console.log(
      `Successfully seeded ${entries.length} Sub Type of Work entries.`,
    );
  } catch (error) {
    console.error("Error seeding Sub Type of Work:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedSubTypeOfWork();
