const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const PermissionSchema = new mongoose.Schema({
  name: String,
  category: String,
});
const Permission = mongoose.model(
  "Permission",
  PermissionSchema,
  "permissions",
);

async function listPermissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const perms = await Permission.find({
      name: { $regex: /panchayat/i },
    });
    console.log(
      "Found permissions:",
      perms.map((p) => p.name),
    );
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

listPermissions();
