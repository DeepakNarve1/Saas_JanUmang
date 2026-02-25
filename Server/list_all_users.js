const mongoose = require("mongoose");
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

console.log("Script starting...");
async function listUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    // Get collections directly to avoid model compilation issues if schema changed
    const users = await mongoose.connection.db
      .collection("users")
      .find({})
      .toArray();
    const roles = await mongoose.connection.db
      .collection("roles")
      .find({})
      .toArray();
    const tenants = await mongoose.connection.db
      .collection("tenants")
      .find({})
      .toArray();

    const roleMap = new Map(roles.map((r) => [r._id.toString(), r]));
    const tenantMap = new Map(tenants.map((t) => [t._id.toString(), t]));

    console.log("\n--- ALL USERS IN DATABASE ---\n");
    console.log(
      `${"NAME".padEnd(20)} | ${"EMAIL".padEnd(30)} | ${"LEVEL".padEnd(15)} | ${"TENANT".padEnd(15)} | ${"ROLE"}`,
    );
    console.log("-".repeat(100));

    users.forEach((user) => {
      const tenant = user.tenantId
        ? tenantMap.get(user.tenantId.toString())?.name || user.tenantId
        : "GLOBAL";

      let roleDisplay = "None";
      if (user.role) {
        const roleDoc = roleMap.get(user.role.toString());
        roleDisplay = roleDoc ? roleDoc.displayName || roleDoc.name : user.role;
      }

      console.log(
        `${(user.name || "N/A").padEnd(20)} | ` +
          `${(user.email || "N/A").padEnd(30)} | ` +
          `${(user.level || "N/A").padEnd(15)} | ` +
          `${String(tenant).padEnd(15)} | ` +
          `${roleDisplay}`,
      );
    });

    console.log(`\nTotal Users: ${users.length}`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

listUsers();
