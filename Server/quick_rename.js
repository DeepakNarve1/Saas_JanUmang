const mongoose = require("mongoose");

// Hardcoded URI
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected.");

    const db = mongoose.connection.db;
    const collection = db.collection("permissions");

    const mappings = {
      view_panchayat: "view_panchayats",
      create_panchayat: "create_panchayats",
      edit_panchayat: "edit_panchayats",
      delete_panchayat: "delete_panchayats",
    };

    for (const [oldName, newName] of Object.entries(mappings)) {
      const res = await collection.updateOne(
        { name: oldName },
        { $set: { name: newName } },
      );

      if (res.matchedCount > 0) {
        console.log(`✅ Renamed '${oldName}' -> '${newName}'`);
      } else {
        console.log(`ℹ️ '${oldName}' not found (or already renamed).`);
      }
    }

    console.log("Done.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
