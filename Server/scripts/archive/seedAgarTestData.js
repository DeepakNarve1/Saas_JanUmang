require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Models
const User = require("./src/models/userModel");
const Role = require("./src/models/roleModel");
const State = require("./src/models/stateModel");
const District = require("./src/models/districtModel");
const Assembly = require("./src/models/assemblyModel");
const Block = require("./src/models/blockModel");
const Booth = require("./src/models/boothModel");
const Panchayat = require("./src/models/panchayatModel");
const Village = require("./src/models/villageModel");
const Voter = require("./src/models/voterModel");
const AssemblyIssue = require("./src/models/assemblyIssueModel");
const PublicProblem = require("./src/models/publicProblemModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const seedAgarTestData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Agar Test Data Seeding...");

    // 1. Fetch Hierarchy Data for Agar
    const district = await District.findOne({ name: "Agar Malwa" });
    if (!district) {
      console.error(
        "Agar Malwa district not found! Run seedAgarHierarchy.js first.",
      );
      process.exit(1);
    }

    const state = await State.findOne({ name: "Madhya Pradesh" });
    const assembly = await Assembly.findOne({
      name: "Agar",
      district: district._id,
    });
    const block = await Block.findOne({ name: "Agar", assembly: assembly._id });
    const booth = await Booth.findOne({
      name: "Booth No 1 - Agar Town",
      block: block._id,
    });
    const panchayat = await Panchayat.findOne({
      name: "Agar Municipal Council",
      block: block._id,
    });
    const village = await Village.findOne({
      name: "Agar Ward 1",
      panchayat: panchayat._id,
    });

    console.log("Fetched Agar hierarchy IDs...");

    // 2. Create/Update Test User
    // Find a role or use "superadmin" string
    const superAdminRole = await Role.findOne({ name: "superadmin" });
    const roleValue = superAdminRole ? superAdminRole._id : "superadmin";

    const userData = {
      name: "Agar Test Manager",
      email: "agar_admin@test.com",
      password: "password123", // Will be hashed by pre-save hook
      role: roleValue,
      userType: "regularUser",
      level: "district",
      state: state._id,
      division: district.division,
      district: district._id,
      isActive: true,
    };

    let user = await User.findOne({ email: userData.email });
    if (user) {
      // Update existing
      user.name = userData.name;
      user.level = userData.level;
      user.district = userData.district;
      // Re-hash password manually if needed or just save if changed
      user.password = userData.password;
      await user.save();
      console.log(`User ${userData.email} updated.`);
    } else {
      user = await User.create(userData);
      console.log(`User ${userData.email} created.`);
    }

    // 3. Seed Sample Voters
    console.log("Seeding sample voters...");
    const voterNames = ["Ram Singh", "Shanti Devi", "Gopal Das", "Maya Sharma"];
    for (let i = 0; i < voterNames.length; i++) {
      const vData = {
        name: voterNames[i],
        fatherName: "Late " + voterNames[i].split(" ")[0] + " Senior",
        mobileNumber: "987654321" + i,
        age: 25 + i * 5,
        fulladdress: "House " + (10 + i) + ", Ward 1, Agar",
        state: state._id,
        division: district.division,
        district: district._id,
        parliament: block.parliament,
        assembly: assembly._id,
        block: block._id,
        panchayat: panchayat._id,
        village: village._id,
        booth: booth._id,
        boothno: "1",
        voterId: "AGR/VOT/" + (1000 + i),
        createdBy: user._id,
      };
      await Voter.findOneAndUpdate({ voterId: vData.voterId }, vData, {
        upsert: true,
      });
    }

    // 4. Seed Assembly Issues
    console.log("Seeding sample assembly issues...");
    const issues = [
      "Water logging in Ward 1 during rains",
      "Street light repair needed near Booth 1",
      "Potholes on main road connecting Agar to Barod",
    ];
    for (let i = 0; i < issues.length; i++) {
      const issueData = {
        year: "2024",
        month: "February",
        date: "04-02-2024",
        block: block.name,
        boothName: booth.name,
        boothNo: "1",
        panchayatName: panchayat.name,
        village: village.name,
        workProblem: issues[i],
        office: "Municipal Office",
        approximateCost: 50000 + i * 10000,
        department: "PWD",
        priority: i === 0 ? "High" : "Medium",
        status: "Pending",
        district: "Agar Malwa",
        assembly: "Agar",
        addedBy: user.name,
        issueType: "assembly-issue",
      };
      // We use save() to trigger the pre-save uniqueId logic
      const existingIssue = await AssemblyIssue.findOne({
        workProblem: issueData.workProblem,
        village: issueData.village,
      });
      if (!existingIssue) {
        await new AssemblyIssue(issueData).save();
      }
    }

    // 5. Seed Public Problems
    console.log("Seeding sample public problems...");
    const problems = [
      "Primary School building needs renovation",
      "Lack of drainage system in new colony",
    ];
    for (let i = 0; i < problems.length; i++) {
      const probData = {
        regNo: "PB/AGR/" + (500 + i),
        year: "2024",
        month: "February",
        district: "Agar Malwa",
        assembly: "Agar",
        block: "Agar",
        boothName: booth.name,
        panchayatName: panchayat.name,
        village: village.name,
        workProblem: problems[i],
        department: "Education/PWD",
        status: "Pending",
        addedBy: user.name,
        dateString: "04-02-2024",
      };
      await PublicProblem.findOneAndUpdate(
        { regNo: probData.regNo },
        probData,
        { upsert: true },
      );
    }

    console.log("\nAgar Test Data Seeding Complete!");
    console.log("-----------------------------------------");
    console.log("Credentials:");
    console.log(`Email: ${userData.email}`);
    console.log(`Password: ${userData.password}`);
    console.log("-----------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedAgarTestData();
