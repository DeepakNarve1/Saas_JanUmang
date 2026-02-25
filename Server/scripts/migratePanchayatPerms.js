const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const PermissionSchema = new mongoose.Schema({
  name: String,
  displayName: String,
  description: String,
  category: String,
});
const Permission = mongoose.model(
  "Permission",
  PermissionSchema,
  "permissions",
);

async function migratePermissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const actions = ["view", "create", "edit", "delete"];

    for (const action of actions) {
      const plural = `${action}_panchayats`;
      const singular = `${action}_panchayat`;

      const perm = await Permission.findOne({ name: plural });
      if (perm) {
        console.log(`Found plural permission: ${plural}`);

        // Check if singular already exists
        const existingSingular = await Permission.findOne({ name: singular });
        if (existingSingular) {
          console.log(
            `Singular permission ${singular} already exists! Skipping rename.`,
          );
          // Maybe delete plural if singular exists?
          // But roles might be attached to plural.
          // Better to keep singular standard.
        } else {
          perm.name = singular;
          perm.category = "panchayat"; // Update category to singular
          if (action === "view") perm.displayName = "View Panchayat";
          if (action === "create") perm.displayName = "Create Panchayat";
          if (action === "edit") perm.displayName = "Edit Panchayat";
          if (action === "delete") perm.displayName = "Delete Panchayat";

          await perm.save();
          console.log(`✅ Renamed to ${singular}`);
        }
      } else {
        console.log(`Plural permission ${plural} not found.`);
        // Check if singular exists
        const s = await Permission.findOne({ name: singular });
        if (s) console.log(`Singular permission ${singular} already exists.`);
        else {
          console.log(`Creating ${singular}...`);
          await Permission.create({
            name: singular,
            displayName: `${action.charAt(0).toUpperCase() + action.slice(1)} Panchayat`,
            description: `Can ${action} panchayat`,
            category: "panchayat",
          });
          console.log(`✅ Created ${singular}`);
        }
      }
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

migratePermissions();
