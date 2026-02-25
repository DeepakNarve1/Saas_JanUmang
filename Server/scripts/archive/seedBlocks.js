require("dotenv").config();
const mongoose = require("mongoose");
const Block = require("./src/models/blockModel");
const Assembly = require("./src/models/assemblyModel");
const Parliament = require("./src/models/parliamentModel");
const District = require("./src/models/districtModel");
const Division = require("./src/models/divisionModel");
const State = require("./src/models/stateModel");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db",
    );
    console.log("MongoDB Connected for Seeding Blocks...");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const realBlocksData = [
  { assembly: "Sheopur", blocks: ["Sheopur", "Karahal"] },
  { assembly: "Vijaypur", blocks: ["Vijaypur", "Beerpur"] },
  { assembly: "Sabalgarh", blocks: ["Sabalgarh"] },
  { assembly: "Joura", blocks: ["Joura"] },
  { assembly: "Sumawali", blocks: ["Sumawali"] },
  { assembly: "Morena", blocks: ["Morena"] },
  { assembly: "Dimani", blocks: ["Dimani"] },
  { assembly: "Ambah", blocks: ["Ambah"] },
  { assembly: "Ater", blocks: ["Ater"] },
  { assembly: "Bhind", blocks: ["Bhind"] },
  { assembly: "Lahar", blocks: ["Lahar"] },
  { assembly: "Mehgaon", blocks: ["Mehgaon"] },
  { assembly: "Gohad", blocks: ["Gohad"] },
  { assembly: "Gwalior Rural", blocks: ["Morar"] },
  { assembly: "Gwalior", blocks: ["Gwalior City"] },
  { assembly: "Gwalior East", blocks: ["Gwalior East"] },
  { assembly: "Gwalior South", blocks: ["Gwalior South"] },
  { assembly: "Bhitarwar", blocks: ["Bhitarwar"] },
  { assembly: "Dabra", blocks: ["Dabra"] },
  { assembly: "Sewda", blocks: ["Sewda"] },
  { assembly: "Bhander", blocks: ["Bhander"] },
  { assembly: "Datia", blocks: ["Datia"] },
  { assembly: "Karera", blocks: ["Karera"] },
  { assembly: "Pohari", blocks: ["Pohari"] },
  { assembly: "Shivpuri", blocks: ["Shivpuri"] },
  { assembly: "Pichhore", blocks: ["Pichhore"] },
  { assembly: "Kolaras", blocks: ["Kolaras"] },
  { assembly: "Bamori", blocks: ["Bamori"] },
  { assembly: "Guna", blocks: ["Guna"] },
  { assembly: "Chachoura", blocks: ["Chachoura"] },
  { assembly: "Raghogarh", blocks: ["Raghogarh"] },
  { assembly: "Ashok Nagar", blocks: ["Ashok Nagar"] },
  { assembly: "Chanderi", blocks: ["Chanderi"] },
  { assembly: "Mungaoli", blocks: ["Mungaoli"] },
  { assembly: "Bina", blocks: ["Bina"] },
  { assembly: "Khurai", blocks: ["Khurai"] },
  { assembly: "Surkhi", blocks: ["Rahatgarh"] },
  { assembly: "Deori", blocks: ["Deori"] },
  { assembly: "Rehli", blocks: ["Rehli"] },
  { assembly: "Naryoli", blocks: ["Sagar Rural"] },
  { assembly: "Sagar", blocks: ["Sagar City"] },
  { assembly: "Banda", blocks: ["Banda"] },
  { assembly: "Tikamgarh", blocks: ["Tikamgarh"] },
  { assembly: "Jatara", blocks: ["Jatara"] },
  { assembly: "Prithvipur", blocks: ["Prithvipur"] },
  { assembly: "Niwari", blocks: ["Niwari"] },
  { assembly: "Maharajpur", blocks: ["Nowgong"] },
  { assembly: "Chandla", blocks: ["Chandla"] },
  { assembly: "Rajnagar", blocks: ["Rajnagar"] },
  { assembly: "Chhatarpur", blocks: ["Chhatarpur"] },
  { assembly: "Bijawar", blocks: ["Bijawar"] },
  { assembly: "Malhara", blocks: ["Buxwaha"] },
  { assembly: "Pathariya", blocks: ["Pathariya"] },
  { assembly: "Damoh", blocks: ["Damoh"] },
  { assembly: "Jabera", blocks: ["Jabera"] },
  { assembly: "Hatta", blocks: ["Hatta"] },
  { assembly: "Pawai", blocks: ["Pawai"] },
  { assembly: "Gunnaor", blocks: ["Gunnaor"] },
  { assembly: "Panna", blocks: ["Panna"] },
  { assembly: "Sirmour", blocks: ["Sirmour"] },
  { assembly: "Semariya", blocks: ["Semariya"] },
  { assembly: "Teonthar", blocks: ["Teonthar"] },
  { assembly: "Mauganj", blocks: ["Mauganj"] },
  { assembly: "Deotalab", blocks: ["Naigarhi"] },
  { assembly: "Mangawan", blocks: ["Gangev"] },
  { assembly: "Rewa", blocks: ["Rewa"] },
  { assembly: "Gurh", blocks: ["Raipur Karchuliyan"] },
  { assembly: "Chitrakoot", blocks: ["Majhgawan"] },
  { assembly: "Raigaon", blocks: ["Sohawal"] },
  { assembly: "Satna", blocks: ["Satna"] },
  { assembly: "Nagod", blocks: ["Nagod"] },
  { assembly: "Maihar", blocks: ["Maihar"] },
  { assembly: "Amarpatan", blocks: ["Amarpatan"] },
  { assembly: "Rampur-Baghelan", blocks: ["Rampur Baghelan"] },
  { assembly: "Churhat", blocks: ["Rampur Naikin"] },
  { assembly: "Sidhi", blocks: ["Sidhi"] },
  { assembly: "Sihawal", blocks: ["Sihawal"] },
  { assembly: "Dhauhani", blocks: ["Kusmi"] },
  { assembly: "Chitrangi", blocks: ["Chitrangi"] },
  { assembly: "Singrauli", blocks: ["Waidhan"] },
  { assembly: "Devsar", blocks: ["Deosar"] },
  { assembly: "Beohari", blocks: ["Beohari"] },
  { assembly: "Jaisinghnagar", blocks: ["Jaisinghnagar"] },
  { assembly: "Jaitpur", blocks: ["Gohparu"] },
  { assembly: "Kotma", blocks: ["Kotma"] },
  { assembly: "Anuppur", blocks: ["Anuppur"] },
  { assembly: "Pushprajgarh", blocks: ["Pushprajgarh"] },
  { assembly: "Bandhavgarh", blocks: ["Karkeli"] },
  { assembly: "Manpur", blocks: ["Manpur"] },
  { assembly: "Patan", blocks: ["Patan"] },
  { assembly: "Bargi", blocks: ["Shahpura"] },
  { assembly: "Jabalpur East", blocks: ["Jabalpur City 1"] },
  { assembly: "Jabalpur North", blocks: ["Jabalpur City 2"] },
  { assembly: "Jabalpur Cantt", blocks: ["Jabalpur Cantt"] },
  { assembly: "Jabalpur West", blocks: ["Jabalpur City 3"] },
  { assembly: "Panagar", blocks: ["Panagar"] },
  { assembly: "Sihora", blocks: ["Sihora"] },
  { assembly: "Barwara", blocks: ["Barwara"] },
  { assembly: "Vijayraghavgarh", blocks: ["Vijayraghavgarh"] },
  { assembly: "Mudwara", blocks: ["Katni"] },
  { assembly: "Bahoriband", blocks: ["Bahoriband"] },
  { assembly: "Shahpura", blocks: ["Shahpura"] },
  { assembly: "Dindori", blocks: ["Dindori"] },
  { assembly: "Bichhiya", blocks: ["Bichhiya"] },
  { assembly: "Niwas", blocks: ["Niwas"] },
  { assembly: "Mandla", blocks: ["Mandla"] },
  { assembly: "Baihar", blocks: ["Baihar"] },
  { assembly: "Lanji", blocks: ["Lanji"] },
  { assembly: "Paraswada", blocks: ["Paraswada"] },
  { assembly: "Balaghat", blocks: ["Balaghat"] },
  { assembly: "Waraseoni", blocks: ["Waraseoni"] },
  { assembly: "Katangi", blocks: ["Katangi"] },
  { assembly: "Barghat", blocks: ["Barghat"] },
  { assembly: "Seoni", blocks: ["Seoni"] },
  { assembly: "Keolari", blocks: ["Keolari"] },
  { assembly: "Lakhnadon", blocks: ["Lakhnadon"] },
  { assembly: "Gotegaon", blocks: ["Gotegaon"] },
  { assembly: "Narsingpur", blocks: ["Narsinghpur"] },
  { assembly: "Tendukheda", blocks: ["Chawarpatha"] },
  { assembly: "Gadarwara", blocks: ["Gadarwara"] },
  { assembly: "Junnardeo", blocks: ["Junnardeo"] },
  { assembly: "Amarwara", blocks: ["Amarwara"] },
  { assembly: "Churai", blocks: ["Chaurai"] },
  { assembly: "Saunsar", blocks: ["Sausar"] },
  { assembly: "Chhindwara", blocks: ["Chhindwara"] },
  { assembly: "Parasia", blocks: ["Parasia"] },
  { assembly: "Pandhurna", blocks: ["Pandhurna"] },
  { assembly: "Seoni-Malwa", blocks: ["Seoni Malwa"] },
  { assembly: "Hoshangabad", blocks: ["Narmadapuram"] },
  { assembly: "Sohagpur", blocks: ["Sohagpur"] },
  { assembly: "Pipariya", blocks: ["Pipariya"] },
  { assembly: "Harda", blocks: ["Harda"] },
  { assembly: "Timarni", blocks: ["Timarni"] },
  { assembly: "Multai", blocks: ["Multai"] },
  { assembly: "Amla", blocks: ["Amla"] },
  { assembly: "Betul", blocks: ["Betul"] },
  { assembly: "Ghoradongri", blocks: ["Ghoradongri"] },
  { assembly: "Bhainsdehi", blocks: ["Bhainsdehi"] },
  { assembly: "Berasia", blocks: ["Berasia"] },
  { assembly: "Bhopal Uttar", blocks: ["Bhopal City (North)"] },
  { assembly: "Narela", blocks: ["Bhopal City (Narela)"] },
  { assembly: "Bhopal Dakshin-Paschim", blocks: ["Bhopal City (SW)"] },
  { assembly: "Bhopal Madhya", blocks: ["Bhopal City (Central)"] },
  { assembly: "Govindpura", blocks: ["Bhopal City (Govindpura)"] },
  { assembly: "Huzur", blocks: ["Phanda"] },
  { assembly: "Budhni", blocks: ["Budhni"] },
  { assembly: "Ashta", blocks: ["Ashta"] },
  { assembly: "Ichhawar", blocks: ["Ichhawar"] },
  { assembly: "Sehore", blocks: ["Sehore"] },
  { assembly: "Udaipura", blocks: ["Udaipura"] },
  { assembly: "Bhojpur", blocks: ["Obedullaganj"] },
  { assembly: "Sanchi", blocks: ["Sanchi"] },
  { assembly: "Silwani", blocks: ["Silwani"] },
  { assembly: "Vidisha", blocks: ["Vidisha"] },
  { assembly: "Basoda", blocks: ["Basoda"] },
  { assembly: "Kurwai", blocks: ["Kurwai"] },
  { assembly: "Sironj", blocks: ["Sironj"] },
  { assembly: "Shamshabad", blocks: ["Nateran"] },
  { assembly: "Narsinghgarh", blocks: ["Narsinghgarh"] },
  { assembly: "Biaora", blocks: ["Biaora"] },
  { assembly: "Rajgarh", blocks: ["Rajgarh"] },
  { assembly: "Khilchipur", blocks: ["Khilchipur"] },
  { assembly: "Sarangpur", blocks: ["Sarangpur"] },
  { assembly: "Depalpur", blocks: ["Depalpur"] },
  { assembly: "Indore-1", blocks: ["Indore City 1"] },
  { assembly: "Indore-2", blocks: ["Indore City 2"] },
  { assembly: "Indore-3", blocks: ["Indore City 3"] },
  { assembly: "Indore-4", blocks: ["Indore City 4"] },
  { assembly: "Indore-5", blocks: ["Indore City 5"] },
  { assembly: "Dr. Ambedkar Nagar-Mhow", blocks: ["Mhow"] },
  { assembly: "Rau", blocks: ["Rau"] },
  { assembly: "Sanwer", blocks: ["Sanwer"] },
  { assembly: "Sardarpur", blocks: ["Sardarpur"] },
  { assembly: "Gandhwani", blocks: ["Gandhwani"] },
  { assembly: "Kukshi", blocks: ["Kukshi"] },
  { assembly: "Manawar", blocks: ["Manawar"] },
  { assembly: "Dharampuri", blocks: ["Dharampuri"] },
  { assembly: "Dhar", blocks: ["Dhar"] },
  { assembly: "Badnawar", blocks: ["Badnawar"] },
  { assembly: "Jhabua", blocks: ["Jhabua"] },
  { assembly: "Thandla", blocks: ["Thandla"] },
  { assembly: "Petlawad", blocks: ["Petlawad"] },
  { assembly: "Alirajpur", blocks: ["Alirajpur"] },
  { assembly: "Jobat", blocks: ["Jobat"] },
  { assembly: "Maheshwar", blocks: ["Maheshwar"] },
  { assembly: "Kasrawad", blocks: ["Kasrawad"] },
  { assembly: "Khargone", blocks: ["Khargone"] },
  { assembly: "Bhagwanpura", blocks: ["Bhagwanpura"] },
  { assembly: "Bhikangaon", blocks: ["Bhikangaon"] },
  { assembly: "Badwah", blocks: ["Barwah"] },
  { assembly: "Sendhwwa", blocks: ["Sendhwa"] },
  { assembly: "Rajpur", blocks: ["Rajpur"] },
  { assembly: "Pansemal", blocks: ["Pansemal"] },
  { assembly: "Barwani", blocks: ["Barwani"] },
  { assembly: "Khandwa", blocks: ["Khandwa"] },
  { assembly: "Pandhana", blocks: ["Pandhana"] },
  { assembly: "Harsud", blocks: ["Harsud"] },
  { assembly: "Mandhata", blocks: ["Punasa"] },
  { assembly: "Nepanagar", blocks: ["Khaknar"] },
  { assembly: "Burhanpur", blocks: ["Burhanpur"] },
  { assembly: "Nagada-Khachrod", blocks: ["Khachrod"] },
  { assembly: "Mahidpur", blocks: ["Mahidpur"] },
  { assembly: "Tarana", blocks: ["Tarana"] },
  { assembly: "Ghatiya", blocks: ["Ghatiya"] },
  { assembly: "Ujjain North", blocks: ["Ujjain City 1"] },
  { assembly: "Ujjain South", blocks: ["Ujjain City 2"] },
  { assembly: "Badnagar", blocks: ["Barnagar"] },
  { assembly: "Ratlam Rural", blocks: ["Ratlam"] },
  { assembly: "Ratlam City", blocks: ["Ratlam City"] },
  { assembly: "Sailana", blocks: ["Sailana"] },
  { assembly: "Jaora", blocks: ["Jaora"] },
  { assembly: "Alot", blocks: ["Alot"] },
  { assembly: "Mandsaur", blocks: ["Mandsaur"] },
  { assembly: "Malhargarh", blocks: ["Malhargarh"] },
  { assembly: "Suwasra", blocks: ["Sitamau"] },
  { assembly: "Garoth", blocks: ["Garoth"] },
  { assembly: "Manasa", blocks: ["Manasa"] },
  { assembly: "Neemuch", blocks: ["Neemuch"] },
  { assembly: "Jawad", blocks: ["Jawad"] },
  { assembly: "Sonkatch", blocks: ["Sonkatch"] },
  { assembly: "Dewas", blocks: ["Dewas"] },
  { assembly: "Hatpipliya", blocks: ["Tonk Khurd"] },
  { assembly: "Khategaon", blocks: ["Khategaon"] },
  { assembly: "Bagli", blocks: ["Bagli"] },
  { assembly: "Shajapur", blocks: ["Shajapur"] },
  { assembly: "Shujalpur", blocks: ["Shujalpur"] },
  { assembly: "Kalapipal", blocks: ["Kalapipal"] },
  { assembly: "Agar", blocks: ["Agar"] },
  { assembly: "Susner", blocks: ["Susner"] },
];

const seedBlocks = async () => {
  await connectDB();

  try {
    // 1. Fetch all assemblies (needed to attach blocks to valid hierarchy)
    const assemblies = await Assembly.find({}).populate("parliament");

    if (assemblies.length === 0) {
      console.log(
        "No assemblies found. Please run seedMasterData.js first to create hierarchy.",
      );
      process.exit(0);
    }

    console.log(
      `Found ${assemblies.length} assemblies. Clearing old blocks...`,
    );
    await Block.deleteMany({});

    console.log("Seeding real blocks...");

    const blocksToInsert = [];
    const year = "2024";

    for (const data of realBlocksData) {
      // Find assembly
      const asm = assemblies.find(
        (a) => a.name.toLowerCase() === data.assembly.toLowerCase(),
      );

      if (!asm) {
        // console.warn(`Assembly not found: ${data.assembly}`);
        continue;
      }

      for (const blockName of data.blocks) {
        blocksToInsert.push({
          name: blockName,
          state: asm.state,
          division: asm.division,
          district: asm.district,
          parliament: asm.parliament?._id || asm.parliament,
          assembly: asm._id,
          year: year,
        });
      }
    }

    if (blocksToInsert.length > 0) {
      await Block.insertMany(blocksToInsert);
      console.log(`Successfully created ${blocksToInsert.length} real blocks.`);
    } else {
      console.log("No matching assemblies found to create blocks.");
    }
  } catch (error) {
    console.error("Error seeding blocks:", error);
  } finally {
    mongoose.connection.close();
  }
};

seedBlocks();
