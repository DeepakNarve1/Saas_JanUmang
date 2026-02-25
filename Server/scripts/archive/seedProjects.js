require("dotenv").config();
const mongoose = require("mongoose");
const Project = require("./src/models/projectModel");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for Seeding Projects...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedProjects = async () => {
  await connectDB();

  // --- CONFIGURATION: Number of Dummy Entries ---
  const NUMBER_OF_ENTRIES = 50;

  const districts = ["Bhopal", "Sehore", "Raisen", "Vidisha", "Rajgarh"];
  const blocks = ["Berasia", "Phanda", "Sehore", "Budhni", "Ichhawar", "Ashta"];
  const departments = [
    "PWD",
    "RES",
    "PHE",
    "Water Resources",
    "Building Corp",
    "MPRDC",
  ];
  const statuses = ["Pending", "In Progress", "Completed"];
  const workNames = [
    "Construction of CC Road",
    "Repair of School Building",
    "Installation of Handpump",
    "Construction of Anganwadi Kendra",
    "Community Hall Construction",
    "Drainage System Improvement",
    "Water Tank Construction",
    "Stop Dam Construction",
  ];
  const officerNames = [
    "R.K. Sharma",
    "A.K. Verma",
    "S.K. Singh",
    "M.P. Gupta",
    "Rajesh Kumar",
  ];

  try {
    // Optional: Clear existing projects if you want a fresh start
    // await Project.deleteMany({});
    // console.log("Cleared existing projects.");

    const projectsToInsert = [];

    for (let i = 0; i < NUMBER_OF_ENTRIES; i++) {
      const dist = districts[Math.floor(Math.random() * districts.length)];
      const blk = blocks[Math.floor(Math.random() * blocks.length)];
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const work = workNames[Math.floor(Math.random() * workNames.length)];
      const cost = (Math.random() * 100 + 1).toFixed(2); // Random cost 1-100 Lakhs
      const estimate = (parseFloat(cost) * 1.1).toFixed(2); // Estimate slightly higher

      projectsToInsert.push({
        district: dist,
        block: blk,
        department: dept,
        workName: `${work} at Village ${i + 1}`,
        projectCost: cost,
        proposalEstimate: estimate,
        tsNoDate: `TS-${1000 + i}/${new Date().getFullYear()}`,
        asNoDate: `AS-${2000 + i}/${new Date().getFullYear()}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        officerName:
          officerNames[Math.floor(Math.random() * officerNames.length)],
        contactNumber: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        remarks: "Generated dummy project data.",
      });
    }

    await Project.insertMany(projectsToInsert);
    console.log(`Successfully seeded ${NUMBER_OF_ENTRIES} dummy projects.`);
  } catch (error) {
    console.error("Error seeding projects:", error);
  } finally {
    mongoose.connection.close();
    console.log("Database connection closed.");
  }
};

seedProjects();
