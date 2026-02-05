require("dotenv").config();
const mongoose = require("mongoose");
const VidhanSabha = require("./src/models/vidhanSabhaModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Vidhan Sabha List...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedVidhanSabhaList = async () => {
  await connectDB();

  const NUMBER_OF_ENTRIES = 20;

  try {
    // Validator requires year % 5 === 2 or 7 (e.g., 2012, 2017, 2022, 2027)
    // Let's generate valid years.
    const validYears = [2007, 2012, 2017, 2022, 2027, 2032];

    // Note: This model seems to represent a "Term" or "Session" or simply the body itself for a given year?
    // Or maybe specific regional sabhas if name varies?
    // Given 'name' and 'year', it might be "Indore Vidhan Sabha - 2022" or just "Vidhan Sabha 2022".
    // I'll mix explicit names.

    const prefixes = [
      "Summer Session",
      "Winter Session",
      "Budget Session",
      "Special Session",
      "General Assembly",
    ];

    const entries = [];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      const year = validYears[Math.floor(Math.random() * validYears.length)];
      const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${year}`;

      // Ensure name is somewhat unique or just distinctive
      entries.push({
        name: `${name} - Batch ${String.fromCharCode(65 + i)}`,
        year: year,
      });
    }

    await VidhanSabha.insertMany(entries);
    console.log(
      `Successfully seeded ${NUMBER_OF_ENTRIES} Vidhan Sabha entries.`,
    );
  } catch (error) {
    console.error("Error seeding Vidhan Sabha:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedVidhanSabhaList();
