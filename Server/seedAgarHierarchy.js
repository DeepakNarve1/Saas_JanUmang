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
      blocks: [
        {
          name: "Agar",
          booths: [
            {
              name: "Booth No 1 - Agar Town",
              code: "AGR001",
              panchayats: [
                {
                  name: "Agar Municipal Council",
                  villages: ["Agar Ward 1", "Agar Ward 2"],
                },
              ],
            },
          ],
        },
        {
          name: "Barod",
          booths: [
            {
              name: "Booth No 1 - Barod",
              code: "BRD001",
              panchayats: [
                {
                  name: "Barod GP",
                  villages: ["Barod Village", "Kamlapur"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Susner",
      blocks: [
        {
          name: "Susner",
          booths: [
            {
              name: "Booth No 1 - Susner",
              code: "SNR001",
              panchayats: [
                {
                  name: "Susner GP",
                  villages: ["Susner Town", "Mana"],
                },
              ],
            },
          ],
        },
        {
          name: "Nalkheda",
          booths: [
            {
              name: "Booth No 1 - Nalkheda",
              code: "NLK001",
              panchayats: [
                {
                  name: "Nalkheda GP",
                  villages: ["Nalkheda Village", "Pipalia"],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const seedAgarHierarchy = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Agar Hierarchy Seeding...");

    // 1. State
    const state = await State.findOneAndUpdate(
      { name: agarData.state },
      { name: agarData.state },
      { upsert: true, new: true },
    );
    console.log(`State: ${state.name}`);

    // 2. Division
    const division = await Division.findOneAndUpdate(
      { name: agarData.division, state: state._id },
      { name: agarData.division, state: state._id },
      { upsert: true, new: true },
    );
    console.log(`  Division: ${division.name}`);

    // 3. District
    const district = await District.findOneAndUpdate(
      { name: agarData.district, division: division._id },
      { name: agarData.district, division: division._id },
      { upsert: true, new: true },
    );
    console.log(`    District: ${district.name}`);

    // 4. Parliament
    const parliament = await Parliament.findOneAndUpdate(
      { name: agarData.parliament },
      {
        name: agarData.parliament,
        division: division._id,
        district: district._id,
      },
      { upsert: true, new: true },
    );
    console.log(`      Parliament: ${parliament.name}`);

    for (const asm of agarData.assemblies) {
      // 5. Assembly
      const assembly = await Assembly.findOneAndUpdate(
        { name: asm.name, district: district._id },
        {
          name: asm.name,
          state: state._id,
          division: division._id,
          district: district._id,
          parliament: parliament._id,
        },
        { upsert: true, new: true },
      );
      console.log(`        Assembly: ${assembly.name}`);

      for (const blk of asm.blocks) {
        // 6. Block
        const block = await Block.findOneAndUpdate(
          { name: blk.name, assembly: assembly._id },
          {
            name: blk.name,
            state: state._id,
            division: division._id,
            district: district._id,
            parliament: parliament._id,
            assembly: assembly._id,
          },
          { upsert: true, new: true },
        );
        console.log(`          Block: ${block.name}`);

        for (const bth of blk.booths) {
          // 7. Booth
          const booth = await Booth.findOneAndUpdate(
            { name: bth.name, block: block._id },
            {
              name: bth.name,
              code: bth.code,
              block: block._id,
              state: state._id,
              division: division._id,
              district: district._id,
              parliament: parliament._id,
              assembly: assembly._id,
            },
            { upsert: true, new: true },
          );
          console.log(`            Booth: ${booth.name}`);

          for (const pjt of bth.panchayats) {
            // 8. Panchayat
            const panchayat = await Panchayat.findOneAndUpdate(
              { name: pjt.name, block: block._id },
              {
                name: pjt.name,
                state: state._id,
                division: division._id,
                district: district._id,
                parliament: parliament._id,
                assembly: assembly._id,
                block: block._id,
                booth: booth._id,
              },
              { upsert: true, new: true },
            );
            console.log(`              Panchayat: ${panchayat.name}`);

            for (const vlgName of pjt.villages) {
              // 9. Village
              await Village.findOneAndUpdate(
                { name: vlgName, panchayat: panchayat._id },
                {
                  name: vlgName,
                  state: state._id,
                  division: division._id,
                  district: district._id,
                  parliament: parliament._id,
                  assembly: assembly._id,
                  block: block._id,
                  booth: booth._id,
                  panchayat: panchayat._id,
                  status: true,
                },
                { upsert: true },
              );
              console.log(`                Village: ${vlgName}`);
            }
          }
        }
      }
    }

    console.log("\nAgar Malwa Hierarchy Seeding Complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedAgarHierarchy();
