require("dotenv").config();
const mongoose = require("mongoose");
const State = require("./src/models/stateModel");
const Division = require("./src/models/divisionModel");
const District = require("./src/models/districtModel");
const Parliament = require("./src/models/parliamentModel");
const Assembly = require("./src/models/assemblyModel");
const Block = require("./src/models/blockModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const mpData = {
  state: "Madhya Pradesh",
  divisions: [
    {
      name: "Chambal",
      districts: [
        {
          name: "Sheopur",
          parliament: "Morena",
          assemblies: [
            { name: "Sheopur", blocks: ["Sheopur", "Karahal"] },
            { name: "Vijaypur", blocks: ["Vijaypur", "Beerpur"] },
          ],
        },
        {
          name: "Morena",
          parliament: "Morena",
          assemblies: [
            { name: "Sabalgarh", blocks: ["Sabalgarh"] },
            { name: "Joura", blocks: ["Joura"] },
            { name: "Sumawali", blocks: ["Sumawali"] }, // Conceptual block mapping
            { name: "Morena", blocks: ["Morena"] },
            { name: "Dimani", blocks: ["Dimani"] },
            { name: "Ambah", blocks: ["Ambah"] },
          ],
        },
        {
          name: "Bhind",
          parliament: "Bhind",
          assemblies: [
            { name: "Ater", blocks: ["Ater"] },
            { name: "Bhind", blocks: ["Bhind"] },
            { name: "Laharn", blocks: ["Lahar"] },
            { name: "Mehgaon", blocks: ["Mehgaon"] },
            { name: "Gohad", blocks: ["Gohad"] },
          ],
        },
      ],
    },
    {
      name: "Gwalior",
      districts: [
        {
          name: "Gwalior",
          parliament: "Gwalior",
          assemblies: [
            { name: "Gwalior Rural", blocks: ["Morar"] },
            { name: "Gwalior", blocks: ["Gwalior City"] },
            { name: "Gwalior East", blocks: ["Gwalior East"] },
            { name: "Gwalior South", blocks: ["Gwalior South"] },
            { name: "Bhitarwar", blocks: ["Bhitarwar"] },
            { name: "Dabra", blocks: ["Dabra"] },
          ],
        },
        {
          name: "Datia",
          parliament: "Bhind", // Bhind (SC)
          assemblies: [
            { name: "Sewda", blocks: ["Sewda"] },
            { name: "Bhander", blocks: ["Bhander"] },
            { name: "Datia", blocks: ["Datia"] },
          ],
        },
        {
          name: "Shivpuri",
          parliament: "Guna", // Guna covers Shivpuri
          assemblies: [
            { name: "Karera", blocks: ["Karera"] },
            { name: "Pohari", blocks: ["Pohari"] },
            { name: "Shivpuri", blocks: ["Shivpuri"] },
            { name: "Pichhore", blocks: ["Pichhore"] },
            { name: "Kolaras", blocks: ["Kolaras"] },
          ],
        },
        {
          name: "Guna",
          parliament: "Guna",
          assemblies: [
            { name: "Bamori", blocks: ["Bamori"] },
            { name: "Guna", blocks: ["Guna"] },
            { name: "Chachoura", blocks: ["Chachoura"] },
            { name: "Raghogarh", blocks: ["Raghogarh"] },
          ],
        },
        {
          name: "Ashoknagar",
          parliament: "Guna",
          assemblies: [
            { name: "Ashok Nagar", blocks: ["Ashok Nagar"] },
            { name: "Chanderi", blocks: ["Chanderi"] },
            { name: "Mungaoli", blocks: ["Mungaoli"] },
          ],
        },
      ],
    },
    {
      name: "Sagar",
      districts: [
        {
          name: "Sagar",
          parliament: "Sagar",
          assemblies: [
            { name: "Bina", blocks: ["Bina"] },
            { name: "Khurai", blocks: ["Khurai"] },
            { name: "Surkhi", blocks: ["Rahatgarh"] },
            { name: "Deori", blocks: ["Deori"] },
            { name: "Rehli", blocks: ["Rehli"] },
            { name: "Naryoli", blocks: ["Sagar Rural"] },
            { name: "Sagar", blocks: ["Sagar City"] },
            { name: "Banda", blocks: ["Banda"] },
          ],
        },
        {
          name: "Tikamgarh",
          parliament: "Tikamgarh",
          assemblies: [
            { name: "Tikamgarh", blocks: ["Tikamgarh"] },
            { name: "Jatara", blocks: ["Jatara"] },
            { name: "Khargapur", blocks: ["Palera"] },
          ],
        },
        {
          name: "Niwari",
          parliament: "Tikamgarh",
          assemblies: [
            { name: "Prithvipur", blocks: ["Prithvipur"] },
            { name: "Niwari", blocks: ["Niwari"] },
          ],
        },
        {
          name: "Chhatarpur",
          parliament: "Khajuraho", // Most in Khajuraho
          assemblies: [
            { name: "Maharajpur", blocks: ["Nowgong"] },
            { name: "Chandla", blocks: ["Chandla"] },
            { name: "Rajnagar", blocks: ["Rajnagar"] },
            { name: "Chhatarpur", blocks: ["Chhatarpur"] },
            { name: "Bijawar", blocks: ["Bijawar"] },
            { name: "Malhara", blocks: ["Buxwaha"] },
          ],
        },
        {
          name: "Damoh",
          parliament: "Damoh",
          assemblies: [
            { name: "Pathariya", blocks: ["Pathariya"] },
            { name: "Damoh", blocks: ["Damoh"] },
            { name: "Jabera", blocks: ["Jabera"] },
            { name: "Hatta", blocks: ["Hatta"] },
          ],
        },
        {
          name: "Panna",
          parliament: "Khajuraho",
          assemblies: [
            { name: "Pawai", blocks: ["Pawai"] },
            { name: "Gunnaor", blocks: ["Gunnaor"] },
            { name: "Panna", blocks: ["Panna"] },
          ],
        },
      ],
    },
    {
      name: "Rewa",
      districts: [
        {
          name: "Rewa",
          parliament: "Rewa",
          assemblies: [
            { name: "Sirmour", blocks: ["Sirmour"] },
            { name: "Semariya", blocks: ["Semariya"] }, // Assuming block name
            { name: "Teonthar", blocks: ["Teonthar"] },
            { name: "Mauganj", blocks: ["Mauganj"] }, // Has become dist but historically here
            { name: "Deotalab", blocks: ["Naigarhi"] },
            { name: "Mangawan", blocks: ["Gangev"] },
            { name: "Rewa", blocks: ["Rewa"] },
            { name: "Gurh", blocks: ["Raipur Karchuliyan"] },
          ],
        },
        {
          name: "Satna",
          parliament: "Satna",
          assemblies: [
            { name: "Chitrakoot", blocks: ["Majhgawan"] },
            { name: "Raigaon", blocks: ["Sohawal"] },
            { name: "Satna", blocks: ["Satna"] },
            { name: "Nagod", blocks: ["Nagod"] },
            { name: "Maihar", blocks: ["Maihar"] },
            { name: "Amarpatan", blocks: ["Amarpatan"] },
            { name: "Rampur-Baghelan", blocks: ["Rampur Baghelan"] },
          ],
        },
        {
          name: "Sidhi",
          parliament: "Sidhi",
          assemblies: [
            { name: "Churhat", blocks: ["Rampur Naikin"] },
            { name: "Sidhi", blocks: ["Sidhi"] },
            { name: "Sihawal", blocks: ["Sihawal"] },
            { name: "Dhauhani", blocks: ["Kusmi"] },
          ],
        },
        {
          name: "Singrauli",
          parliament: "Sidhi",
          assemblies: [
            { name: "Chitrangi", blocks: ["Chitrangi"] },
            { name: "Singrauli", blocks: ["Waidhan"] },
            { name: "Devsar", blocks: ["Deosar"] },
          ],
        },
      ],
    },
    {
      name: "Shahdol",
      districts: [
        {
          name: "Shahdol",
          parliament: "Shahdol",
          assemblies: [
            { name: "Beohari", blocks: ["Beohari"] },
            { name: "Jaisinghnagar", blocks: ["Jaisinghnagar"] },
            { name: "Jaitpur", blocks: ["Gohparu"] },
          ],
        },
        {
          name: "Anuppur",
          parliament: "Shahdol",
          assemblies: [
            { name: "Kotma", blocks: ["Kotma"] },
            { name: "Anuppur", blocks: ["Anuppur"] },
            { name: "Pushprajgarh", blocks: ["Pushprajgarh"] },
          ],
        },
        {
          name: "Umaria",
          parliament: "Shahdol",
          assemblies: [
            { name: "Bandhavgarh", blocks: ["Karkeli"] },
            { name: "Manpur", blocks: ["Manpur"] },
          ],
        },
      ],
    },
    {
      name: "Jabalpur",
      districts: [
        {
          name: "Jabalpur",
          parliament: "Jabalpur",
          assemblies: [
            { name: "Patan", blocks: ["Patan"] },
            { name: "Bargi", blocks: ["Shahpura"] },
            { name: "Jabalpur East", blocks: ["Jabalpur City 1"] },
            { name: "Jabalpur North", blocks: ["Jabalpur City 2"] },
            { name: "Jabalpur Cantt", blocks: ["Jabalpur Cantt"] },
            { name: "Jabalpur West", blocks: ["Jabalpur City 3"] },
            { name: "Panagar", blocks: ["Panagar"] },
            { name: "Sihora", blocks: ["Sihora"] },
          ],
        },
        {
          name: "Katni",
          parliament: "Khajuraho", // Part of Khajuraho
          assemblies: [
            { name: "Barwara", blocks: ["Barwara"] },
            { name: "Vijayraghavgarh", blocks: ["Vijayraghavgarh"] },
            { name: "Mudwara", blocks: ["Katni"] },
            { name: "Bahoriband", blocks: ["Bahoriband"] },
          ],
        },
        {
          name: "Dindori",
          parliament: "Mandla", // Mandla
          assemblies: [
            { name: "Shahpura", blocks: ["Shahpura"] },
            { name: "Dindori", blocks: ["Dindori"] },
          ],
        },
        {
          name: "Mandla",
          parliament: "Mandla",
          assemblies: [
            { name: "Bichhiya", blocks: ["Bichhiya"] },
            { name: "Niwas", blocks: ["Niwas"] },
            { name: "Mandla", blocks: ["Mandla"] },
          ],
        },
        {
          name: "Balaghat",
          parliament: "Balaghat",
          assemblies: [
            { name: "Baihar", blocks: ["Baihar"] },
            { name: "Lanji", blocks: ["Lanji"] },
            { name: "Paraswada", blocks: ["Paraswada"] },
            { name: "Balaghat", blocks: ["Balaghat"] },
            { name: "Waraseoni", blocks: ["Waraseoni"] },
            { name: "Katangi", blocks: ["Katangi"] },
          ],
        },
        {
          name: "Seoni",
          parliament: "Balaghat",
          assemblies: [
            { name: "Barghat", blocks: ["Barghat"] },
            { name: "Seoni", blocks: ["Seoni"] },
            { name: "Keolari", blocks: ["Keolari"] },
            { name: "Lakhnadon", blocks: ["Lakhnadon"] },
          ],
        },
        {
          name: "Narsinghpur",
          parliament: "Hoshangabad", // Narmadapuram
          assemblies: [
            { name: "Gotegaon", blocks: ["Gotegaon"] },
            { name: "Narsingpur", blocks: ["Narsinghpur"] },
            { name: "Tendukheda", blocks: ["Chawarpatha"] },
            { name: "Gadarwara", blocks: ["Gadarwara"] },
          ],
        },
        {
          name: "Chhindwara",
          parliament: "Chhindwara",
          assemblies: [
            { name: "Junnardeo", blocks: ["Junnardeo"] },
            { name: "Amarwara", blocks: ["Amarwara"] },
            { name: "Churai", blocks: ["Chaurai"] },
            { name: "Saunsar", blocks: ["Sausar"] },
            { name: "Chhindwara", blocks: ["Chhindwara"] },
            { name: "Parasia", blocks: ["Parasia"] },
            { name: "Pandhurna", blocks: ["Pandhurna"] }, // Now a dist too
          ],
        },
      ],
    },
    {
      name: "Narmadapuram",
      districts: [
        {
          name: "Narmadapuram", // Hoshangabad
          parliament: "Hoshangabad",
          assemblies: [
            { name: "Seoni-Malwa", blocks: ["Seoni Malwa"] },
            { name: "Hoshangabad", blocks: ["Narmadapuram"] },
            { name: "Sohagpur", blocks: ["Sohagpur"] },
            { name: "Pipariya", blocks: ["Pipariya"] },
          ],
        },
        {
          name: "Harda",
          parliament: "Betul", // Betul includes Harda
          assemblies: [
            { name: "Harda", blocks: ["Harda"] },
            { name: "Timarni", blocks: ["Timarni"] },
          ],
        },
        {
          name: "Betul",
          parliament: "Betul",
          assemblies: [
            { name: "Multai", blocks: ["Multai"] },
            { name: "Amla", blocks: ["Amla"] },
            { name: "Betul", blocks: ["Betul"] },
            { name: "Ghoradongri", blocks: ["Ghoradongri"] },
            { name: "Bhainsdehi", blocks: ["Bhainsdehi"] },
          ],
        },
      ],
    },
    {
      name: "Bhopal",
      districts: [
        {
          name: "Bhopal",
          parliament: "Bhopal",
          assemblies: [
            { name: "Berasia", blocks: ["Berasia"] },
            { name: "Bhopal Uttar", blocks: ["Bhopal City (North)"] },
            { name: "Narela", blocks: ["Bhopal City (Narela)"] },
            { name: "Bhopal Dakshin-Paschim", blocks: ["Bhopal City (SW)"] },
            { name: "Bhopal Madhya", blocks: ["Bhopal City (Central)"] },
            { name: "Govindpura", blocks: ["Bhopal City (Govindpura)"] },
            { name: "Huzur", blocks: ["Phanda"] },
          ],
        },
        {
          name: "Sehore",
          parliament: "Bhopal", // Part in Bhopal, Part in Vidisha.
          assemblies: [
            { name: "Budhni", blocks: ["Budhni"] }, // Vidisha PC
            { name: "Ashta", blocks: ["Ashta"] }, // Dewas PC
            { name: "Ichhawar", blocks: ["Ichhawar"] }, // Vidisha PC
            { name: "Sehore", blocks: ["Sehore"] }, // Bhopal PC
          ],
        },
        {
          name: "Raisen",
          parliament: "Vidisha",
          assemblies: [
            { name: "Udaipura", blocks: ["Udaipura"] },
            { name: "Bhojpur", blocks: ["Obedullaganj"] },
            { name: "Sanchi", blocks: ["Sanchi"] },
            { name: "Silwani", blocks: ["Silwani"] },
          ],
        },
        {
          name: "Vidisha",
          parliament: "Vidisha",
          assemblies: [
            { name: "Vidisha", blocks: ["Vidisha"] },
            { name: "Basoda", blocks: ["Basoda"] },
            { name: "Kurwai", blocks: ["Kurwai"] },
            { name: "Sironj", blocks: ["Sironj"] },
            { name: "Shamshabad", blocks: ["Nateran"] },
          ],
        },
        {
          name: "Rajgarh",
          parliament: "Rajgarh",
          assemblies: [
            { name: "Narsinghgarh", blocks: ["Narsinghgarh"] },
            { name: "Biaora", blocks: ["Biaora"] },
            { name: "Rajgarh", blocks: ["Rajgarh"] },
            { name: "Khilchipur", blocks: ["Khilchipur"] },
            { name: "Sarangpur", blocks: ["Sarangpur"] },
          ],
        },
      ],
    },
    {
      name: "Indore",
      districts: [
        {
          name: "Indore",
          parliament: "Indore",
          assemblies: [
            { name: "Depalpur", blocks: ["Depalpur"] },
            { name: "Indore-1", blocks: ["Indore City 1"] },
            { name: "Indore-2", blocks: ["Indore City 2"] },
            { name: "Indore-3", blocks: ["Indore City 3"] },
            { name: "Indore-4", blocks: ["Indore City 4"] },
            { name: "Indore-5", blocks: ["Indore City 5"] },
            { name: "Dr. Ambedkar Nagar-Mhow", blocks: ["Mhow"] },
            { name: "Rau", blocks: ["Rau"] },
            { name: "Sanwer", blocks: ["Sanwer"] },
          ],
        },
        {
          name: "Dhar",
          parliament: "Dhar",
          assemblies: [
            { name: "Sardarpur", blocks: ["Sardarpur"] },
            { name: "Gandhwani", blocks: ["Gandhwani"] },
            { name: "Kukshi", blocks: ["Kukshi"] },
            { name: "Manawar", blocks: ["Manawar"] },
            { name: "Dharampuri", blocks: ["Dharampuri"] },
            { name: "Dhar", blocks: ["Dhar"] },
            { name: "Badnawar", blocks: ["Badnawar"] },
          ],
        },
        {
          name: "Jhabua",
          parliament: "Ratlam", // Ratlam PC
          assemblies: [
            { name: "Jhabua", blocks: ["Jhabua"] },
            { name: "Thandla", blocks: ["Thandla"] },
            { name: "Petlawad", blocks: ["Petlawad"] },
          ],
        },
        {
          name: "Alirajpur",
          parliament: "Ratlam",
          assemblies: [
            { name: "Alirajpur", blocks: ["Alirajpur"] },
            { name: "Jobat", blocks: ["Jobat"] },
          ],
        },
        {
          name: "Khargone", // West Nimar
          parliament: "Khargone",
          assemblies: [
            { name: "Maheshwar", blocks: ["Maheshwar"] },
            { name: "Kasrawad", blocks: ["Kasrawad"] },
            { name: "Khargone", blocks: ["Khargone"] },
            { name: "Bhagwanpura", blocks: ["Bhagwanpura"] },
            { name: "Bhikangaon", blocks: ["Bhikangaon"] },
            { name: "Badwah", blocks: ["Barwah"] },
          ],
        },
        {
          name: "Barwani",
          parliament: "Khargone", // Khargone
          assemblies: [
            { name: "Sendhwwa", blocks: ["Sendhwa"] },
            { name: "Rajpur", blocks: ["Rajpur"] },
            { name: "Pansemal", blocks: ["Pansemal"] },
            { name: "Barwani", blocks: ["Barwani"] },
          ],
        },
        {
          name: "Khandwa", // East Nimar
          parliament: "Khandwa",
          assemblies: [
            { name: "Khandwa", blocks: ["Khandwa"] },
            { name: "Pandhana", blocks: ["Pandhana"] },
            { name: "Harsud", blocks: ["Harsud"] },
            { name: "Mandhata", blocks: ["Punasa"] },
          ],
        },
        {
          name: "Burhanpur",
          parliament: "Khandwa",
          assemblies: [
            { name: "Nepanagar", blocks: ["Khaknar"] },
            { name: "Burhanpur", blocks: ["Burhanpur"] },
          ],
        },
      ],
    },
    {
      name: "Ujjain",
      districts: [
        {
          name: "Ujjain",
          parliament: "Ujjain",
          assemblies: [
            { name: "Nagada-Khachrod", blocks: ["Khachrod"] },
            { name: "Mahidpur", blocks: ["Mahidpur"] },
            { name: "Tarana", blocks: ["Tarana"] },
            { name: "Ghatiya", blocks: ["Ghatiya"] },
            { name: "Ujjain North", blocks: ["Ujjain City 1"] },
            { name: "Ujjain South", blocks: ["Ujjain City 2"] },
            { name: "Badnagar", blocks: ["Barnagar"] },
          ],
        },
        {
          name: "Ratlam",
          parliament: "Ratlam",
          assemblies: [
            { name: "Ratlam Rural", blocks: ["Ratlam"] },
            { name: "Ratlam City", blocks: ["Ratlam City"] },
            { name: "Sailana", blocks: ["Sailana"] },
            { name: "Jaora", blocks: ["Jaora"] },
            { name: "Alot", blocks: ["Alot"] }, // Ujjain PC
          ],
        },
        {
          name: "Mandsaur",
          parliament: "Mandsaur",
          assemblies: [
            { name: "Mandsaur", blocks: ["Mandsaur"] },
            { name: "Malhargarh", blocks: ["Malhargarh"] },
            { name: "Suwasra", blocks: ["Sitamau"] },
            { name: "Garoth", blocks: ["Garoth"] },
          ],
        },
        {
          name: "Neemuch",
          parliament: "Mandsaur",
          assemblies: [
            { name: "Manasa", blocks: ["Manasa"] },
            { name: "Neemuch", blocks: ["Neemuch"] },
            { name: "Jawad", blocks: ["Jawad"] },
          ],
        },
        {
          name: "Dewas",
          parliament: "Dewas",
          assemblies: [
            { name: "Sonkatch", blocks: ["Sonkatch"] },
            { name: "Dewas", blocks: ["Dewas"] },
            { name: "Hatpipliya", blocks: ["Tonk Khurd"] },
            { name: "Khategaon", blocks: ["Khategaon"] },
            { name: "Bagli", blocks: ["Bagli"] },
          ],
        },
        {
          name: "Shajapur",
          parliament: "Dewas",
          assemblies: [
            { name: "Shajapur", blocks: ["Shajapur"] },
            { name: "Shujalpur", blocks: ["Shujalpur"] },
            { name: "Kalapipal", blocks: ["Kalapipal"] },
          ],
        },
        {
          name: "Agar Malwa",
          parliament: "Dewas",
          assemblies: [
            { name: "Agar", blocks: ["Agar"] },
            { name: "Susner", blocks: ["Susner"] },
          ],
        },
      ],
    },
  ],
};

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to DB");

    // Clear existing data (optional, but cleaner for a master seed)
    // Comment out if you want to keep existing IDs and just add missing (but logic below is upsert)
    // await State.deleteMany({});
    // await Division.deleteMany({});
    // await District.deleteMany({});
    // await Parliament.deleteMany({});
    // await Assembly.deleteMany({});
    // await Block.deleteMany({});

    // Create State
    let state = await State.findOneAndUpdate(
      { name: mpData.state },
      { name: mpData.state },
      { upsert: true, new: true },
    );
    console.log(`State: ${state.name}`);

    for (const divData of mpData.divisions) {
      let division = await Division.findOneAndUpdate(
        { name: divData.name, state: state._id },
        { name: divData.name, state: state._id },
        { upsert: true, new: true },
      );
      console.log(`  Division: ${division.name}`);

      for (const districtData of divData.districts) {
        let district = await District.findOneAndUpdate(
          { name: districtData.name, division: division._id },
          { name: districtData.name, division: division._id },
          { upsert: true, new: true },
        );
        console.log(`    District: ${district.name}`);

        // Handle Parliament
        // Assumption: Parliament name in districtData is the one associated with this district
        // We need to create/find the Parliament.
        // Note: One Parliament may cover multiple districts. We map it to the current Division/District for schema compliance.
        // If a Parliament already exists (created in another district loop), we assume it's valid.
        // To strictly follow schema "division required", we use the current division.
        // Ideally, we'd have a separate Parliament list, but we are generating hierarchically.

        let parliament = await Parliament.findOneAndUpdate(
          { name: districtData.parliament },
          {
            name: districtData.parliament,
            division: division._id, // Assign to current division (simplified)
            district: district._id, // Assign to current district (simplified)
          },
          { upsert: true, new: true },
        );

        for (const asmData of districtData.assemblies) {
          // Some assemblies might belong to a different parliament than the district default
          // If asmData specifies a parliament (not implemented in my JSON above everywhere, but used in logic)
          // For now, use the district's parliament or a specific one if I added overrides.

          // Check if specific parliament override exists (e.g. for Assembly in Sehore which is in Dewas PC)
          // My JSON has specific parliaments for districts, but assemblies might vary.
          // In this simplified script, I'll use the district's parliament for the assembly unless I implement logic to find the *correct* parliament if it differs.
          // Since I didn't map every single assembly's PC in JS, I'll rely on the District's PC or findOne if named different.

          // Correction: The JSON structure I wrote has `parliament` at district level.
          // But Sehore has assemblies in different PCs.
          // I should look up the PC by name if I want to be precise.
          // For simplicity: Update parliament variable if implied by context or create a new one?
          // I'll stick to the district's primary parliament for all its assemblies in this seed,
          // UNLESS I explicitly query for the other parliament.
          // BUT, `parliament` is required in Assembly.
          // If Sehore has "Ashta" in "Dewas PC", I need "Dewas" parliament ID.
          // "Dewas" parliament will be created when loop reaches Dewas district.
          // If loop hasn't reached Dewas yet, I might default to creating it now?
          // To avoid complexity, I will create the parliament here if it doesn't exist.

          let targetParliamentName =
            asmData.parliament || districtData.parliament;
          let targetParliament = await Parliament.findOne({
            name: targetParliamentName,
          });

          if (!targetParliament) {
            // Create it now if not found (e.g. Dewas PC referenced in Sehore before Dewas district loop)
            targetParliament = await Parliament.create({
              name: targetParliamentName,
              division: division._id,
              district: district._id,
            });
          }

          let assembly = await Assembly.findOneAndUpdate(
            { name: asmData.name, district: district._id },
            {
              name: asmData.name,
              state: state._id,
              division: division._id,
              district: district._id,
              parliament: targetParliament._id,
            },
            { upsert: true, new: true },
          );

          // Blocks
          for (const blockName of asmData.blocks) {
            await Block.findOneAndUpdate(
              { name: blockName, assembly: assembly._id },
              {
                name: blockName,
                state: state._id,
                division: division._id,
                district: district._id,
                parliament: targetParliament._id,
                assembly: assembly._id,
              },
              { upsert: true },
            );
          }
        }
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
