require("dotenv").config();
const mongoose = require("mongoose");
const State = require("./src/models/stateModel");
const Division = require("./src/models/divisionModel");
const District = require("./src/models/districtModel");
const Parliament = require("./src/models/parliamentModel");
const Assembly = require("./src/models/assemblyModel");
const Block = require("./src/models/blockModel");
const Booth = require("./src/models/boothModel");
const Panchayat = require("./src/models/panchayatModel");
const Village = require("./src/models/villageModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const agarData = {
  state: "Madhya Pradesh",
  division: "Ujjain",
  district: "Agar Malwa",
  parliament: "Dewas",
  assemblies: [
    {
      name: "Agar",
      blocks: ["Agar", "Barod"],
    },
    {
      name: "Susner",
      blocks: ["Susner", "Nalkheda"],
    },
  ],
};

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. Resolve Global Hierarchy
    let state = await State.findOne({ name: agarData.state });
    if (!state) state = await State.create({ name: agarData.state });

    let division = await Division.findOne({ name: agarData.division });
    if (!division)
      division = await Division.create({
        name: agarData.division,
        state: state._id,
      });

    let district = await District.findOne({ name: agarData.district });
    if (!district)
      district = await District.create({
        name: agarData.district,
        division: division._id,
        state: state._id,
      });

    let parliament = await Parliament.findOne({ name: agarData.parliament });
    if (!parliament)
      parliament = await Parliament.create({
        name: agarData.parliament,
        state: state._id,
        division: division._id,
        district: district._id,
      });

    for (const asmInfo of agarData.assemblies) {
      let assembly = await Assembly.findOne({
        name: asmInfo.name,
        district: district._id,
      });
      if (!assembly) {
        assembly = await Assembly.create({
          name: asmInfo.name,
          state: state._id,
          division: division._id,
          district: district._id,
          parliament: parliament._id,
        });
      }
      console.log(`Processing Assembly: ${assembly.name}`);

      for (const blockName of asmInfo.blocks) {
        let block = await Block.findOne({
          name: blockName,
          assembly: assembly._id,
        });
        if (!block) {
          block = await Block.create({
            name: blockName,
            state: state._id,
            division: division._id,
            district: district._id,
            parliament: parliament._id,
            assembly: assembly._id,
            year: "2024",
          });
        }
        console.log(`  Processing Block: ${block.name}`);

        // Generate 10 Booths for this block
        for (let i = 1; i <= 10; i++) {
          const boothName = `Booth No ${i} - ${block.name}`;
          const boothCode = `${block.name.substring(0, 3).toUpperCase()}${String(i).padStart(3, "0")}`;

          let booth = await Booth.findOne({
            name: boothName,
            block: block._id,
          });
          if (!booth) {
            booth = await Booth.create({
              name: boothName,
              code: boothCode,
              block: block._id,
              state: state._id,
              division: division._id,
              district: district._id,
              parliament: parliament._id,
              assembly: assembly._id,
              year: "2024",
            });
          }

          // Ensure every booth has a panchayat
          const panchayatName = `Gram Panchayat ${block.name} ${i}`;
          let panchayat = await Panchayat.findOne({
            name: panchayatName,
            block: block._id,
          });
          if (!panchayat) {
            panchayat = await Panchayat.create({
              name: panchayatName,
              state: state._id,
              division: division._id,
              district: district._id,
              parliament: parliament._id,
              assembly: assembly._id,
              block: block._id,
              booth: booth._id,
            });
          }

          // Generate 2 Villages for this panchayat
          for (let v = 1; v <= 2; v++) {
            const villageName = `${panchayatName} - Village ${v}`;
            let village = await Village.findOne({
              name: villageName,
              panchayat: panchayat._id,
            });
            if (!village) {
              village = await Village.create({
                name: villageName,
                state: state._id,
                division: division._id,
                district: district._id,
                parliament: parliament._id,
                assembly: assembly._id,
                block: block._id,
                booth: booth._id,
                panchayat: panchayat._id,
                status: true,
              });
            }
          }
        }
      }
    }

    console.log("Agar Malwa Massive Hierarchy Seeding Complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
