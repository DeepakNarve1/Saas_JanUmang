const mongoose = require("mongoose");
const fs = require("fs");
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function check() {
  await mongoose.connect(MONGO_URI);
  const perms = await mongoose.connection.db
    .collection("permissions")
    .find({ module: "roles" })
    .toArray();
  const output =
    "Roles Permissions:\n" +
    perms.map((p) => `- ${p.name} (${p.displayName})`).join("\n");
  fs.writeFileSync("d:/Akalp/Saas/JanUmangSaas/Server/roles_perms.txt", output);
  process.exit(0);
}
check();
