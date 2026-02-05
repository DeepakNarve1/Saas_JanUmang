require("dotenv").config();
const mongoose = require("mongoose");
const PublicProblem = require("./src/models/publicProblemModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Public Problems...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedPublicProblems = async () => {
  await connectDB();

  // --- CONFIGURATION: Number of Dummy Entries ---
  const NUMBER_OF_ENTRIES = 120; // Enough to show multiple pages

  const districts = ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain"];
  const blocks = ["Mhow", "Sanwer", "Depalpur", "Indore-1", "Indore-2"];
  const assemblies = ["Assembly A", "Assembly B", "Assembly C", "Assembly D"];
  const departments = [
    "Police",
    "Health",
    "Education",
    "Municipal Corp",
    "PHE",
    "Electricity",
  ];
  const statuses = ["Pending", "In Progress", "Resolved"];
  const months = ["January", "February", "March", "April", "May"];

  try {
    const problemsToInsert = [];

    // Optional: Clear existing if you want
    // await PublicProblem.deleteMany({});
    // console.log("Cleared existing public problems.");

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      const randMonth = months[Math.floor(Math.random() * months.length)];
      const randDate = new Date();
      randDate.setDate(randDate.getDate() - Math.floor(Math.random() * 30));

      problemsToInsert.push({
        regNo: `REG-${Date.now()}-${i}`,
        srNo: `${i + 1}`,
        day: `${randDate.getDate()}`,
        timer: "00:00:00",
        submissionDate: randDate,
        year: `${2024 + Math.floor(Math.random() * 2)}`,
        month: randMonth,
        dateString: randDate.toISOString().split("T")[0],
        district: districts[Math.floor(Math.random() * districts.length)],
        assembly: assemblies[Math.floor(Math.random() * assemblies.length)],
        block: blocks[Math.floor(Math.random() * blocks.length)],
        recommendedLetterNo: `RL-${1000 + i}`,
        boothNo: `${100 + i}`,
        department: departments[Math.floor(Math.random() * departments.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
      });
    }

    await PublicProblem.insertMany(problemsToInsert);
    console.log(
      `Successfully seeded ${NUMBER_OF_ENTRIES} dummy public problems.`,
    );
  } catch (error) {
    console.error("Error seeding public problems:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

seedPublicProblems();
