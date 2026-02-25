const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGO_URI);
  const permissions = await mongoose.connection.db
    .collection("permissions")
    .find({})
    .toArray();
  const modules = [...new Set(permissions.map((p) => p.module))];
  console.log("Modules in Database Permissions:");
  modules.forEach((m) => console.log(`- ${m}`));

  process.exit(0);
}
check();
