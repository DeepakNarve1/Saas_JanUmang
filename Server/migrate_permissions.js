const mongoose = require("mongoose");

// Hardcoded URI
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

const log = console.log;

const permissionSchema = new mongoose.Schema(
  {
    name: String,
    displayName: String,
  },
  { strict: false },
);
const Permission =
  mongoose.models.Permission || mongoose.model("Permission", permissionSchema);

async function migratePermissions() {
  try {
    log("Connecting...");
    await mongoose.connect(MONGO_URI);
    log("✅ Connected");

    const mappings = {
      view_panchayat: "view_panchayats",
      create_panchayat: "create_panchayats",
      edit_panchayat: "edit_panchayats",
      delete_panchayat: "delete_panchayats",
    };

    for (const [oldName, newName] of Object.entries(mappings)) {
      const perm = await Permission.findOne({ name: oldName });
      if (perm) {
        log(
          `Found legacy permission '${oldName}' (${perm._id}). Renaming to '${newName}'...`,
        );

        // Check if new name already exists to avoid duplicate error
        const existingNew = await Permission.findOne({ name: newName });
        if (existingNew) {
          log(
            `⚠️ Permission '${newName}' already exists! Cannot rename '${oldName}'.`,
          );
          log(
            `ACTION REQUIRED: You may need to merge these or delete the old one.`,
          );
        } else {
          perm.name = newName;

          // Optional: Update display name if it looks singular
          if (perm.displayName && perm.displayName.endsWith("Panchayat")) {
            perm.displayName = perm.displayName + "s";
          }

          await perm.save();
          log(`✅ Successfully renamed to '${newName}'`);
        }
      } else {
        log(
          `ℹ️ Permission '${oldName}' not found. Already migrated or missing.`,
        );
      }
    }

    log("Migration complete.");
    process.exit(0);
  } catch (e) {
    log("❌ Error: " + e.stack);
    process.exit(1);
  }
}

migratePermissions();
