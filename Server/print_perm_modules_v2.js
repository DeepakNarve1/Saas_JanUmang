const mongoose = require("mongoose");
const fs = require("fs");
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

async function check() {
  try {
    await mongoose.connect(MONGO_URI);
    const permissions = await mongoose.connection.db
      .collection("permissions")
      .find({})
      .toArray();
    const modules = [...new Set(permissions.map((p) => p.module))];
    const output =
      "Modules in Database Permissions:\n" +
      modules.map((m) => "- " + m).join("\n");
    fs.writeFileSync(
      "d:/Akalp/Saas/JanUmangSaas/Server/perm_modules_output.txt",
      output,
    );
    process.exit(0);
  } catch (e) {
    fs.writeFileSync(
      "d:/Akalp/Saas/JanUmangSaas/Server/perm_modules_output.txt",
      e.stack,
    );
    process.exit(1);
  }
}
check();
