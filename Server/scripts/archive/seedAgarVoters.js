require("dotenv").config();
const mongoose = require("mongoose");
const Voter = require("./src/models/voterModel");
const State = require("./src/models/stateModel");
const District = require("./src/models/districtModel");
const Assembly = require("./src/models/assemblyModel");
const Block = require("./src/models/blockModel");
const Booth = require("./src/models/boothModel");
const Village = require("./src/models/villageModel");
const Tenant = require("./src/models/tenantModel");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/adminlte_db";

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for Voter Seeding...");

    const district = await District.findOne({ name: "Agar Malwa" });
    if (!district) throw new Error("District not found");

    const tenant = await Tenant.findOne({}); // Just use the first tenant
    const tenantId = tenant ? tenant._id : new mongoose.Types.ObjectId();

    const blocks = await Block.find({ district: district._id });

    for (const block of blocks) {
      console.log(`Seeding voters for Block: ${block.name}`);
      const booths = await Booth.find({ block: block._id }).limit(2);

      for (const booth of booths) {
        const villages = await Village.find({ booth: booth._id });

        if (villages.length === 0) {
          console.log(
            `  No villages found for booth ${booth.name}, skipping voters.`,
          );
          continue;
        }

        for (let i = 1; i <= 5; i++) {
          const village = villages[i % villages.length];
          const voterName = `${block.name} Voter ${booth.code} ${i}`;
          const voterId = `AGR-${booth.code}-${String(i).padStart(3, "0")}`;

          await Voter.findOneAndUpdate(
            { voterId: voterId, tenantId: tenantId },
            {
              name: voterName,
              fatherName: `Parent of ${voterName}`,
              mobileNumber: `91111${Math.floor(Math.random() * 89999 + 10000)}`,
              age: 18 + Math.floor(Math.random() * 60),
              fulladdress: `House ${i}, ${village.name}, ${block.name}`,
              state: block.state,
              division: block.division,
              district: block.district,
              parliament: block.parliament,
              assembly: block.assembly,
              block: block._id,
              panchayat: village.panchayat,
              village: village._id,
              booth: booth._id,
              boothno: booth.code,
              voterId: voterId,
              tenantId: tenantId,
              source: "NEW",
              isActive: true,
            },
            { upsert: true },
          );
        }
      }
    }

    console.log("Voter Seeding for Agar Malwa Complete!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
