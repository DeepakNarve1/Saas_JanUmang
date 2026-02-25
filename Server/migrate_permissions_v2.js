const mongoose = require("mongoose");

// Hardcoded URI
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

const log = console.log;

// Schema for accessing Permission collection directly
const permissionSchema = new mongoose.Schema(
  {
    name: String,
    displayName: String,
  },
  { strict: false },
);

// Register model
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

    // Process each mapping
    for (const oldName of Object.keys(mappings)) {
      const newName = mappings[oldName];

      // Step 1: Find the OLD permission
      const oldPerm = await Permission.findOne({ name: oldName });

      if (!oldPerm) {
        log(
          `ℹ️ Permission '${oldName}' not found. (Assuming already migrated or never existed)`,
        );
        continue;
      }

      log(`Found legacy permission '${oldName}' (ID: ${oldPerm._id})`);

      // Step 2: Check if NEW permission already exists
      const existingNew = await Permission.findOne({ name: newName });

      if (existingNew) {
        log(
          `⚠️ Target permission '${newName}' (ID: ${existingNew._id}) ALREADY EXISTS.`,
        );
        log(`   Cannot simply rename. Merging roles might be needed.`);
        // Note: Merging roles is complex. For now, let's assume we want to KEEP the old ID but use new name?
        // NO, if new one exists, let's keep the NEW one and delete OLD one?
        // But then we lose references in Roles.
        // Better strategy: Delete 'existingNew' if it has NO roles attached? Or merge?
        // safest for this context: Rename OLD to NEW_TEMP, delete NEW, rename TEMMP to NEW?

        // Simpler: Just log it and skip for manual intervention or a more complex merge script.
        // BUT wait, user said 'view_panchayats' was NOT FOUND in Check script.
        // So existingNew should be null.
      } else {
        // Step 3: Rename
        log(`   Renaming to '${newName}'...`);
        oldPerm.name = newName;

        // Update display name too if possible
        if (oldPerm.displayName) {
          // e.g. "View Panchayat" -> "View Panchayats"
          if (!oldPerm.displayName.endsWith("s")) {
            oldPerm.displayName += "s";
          }
        }

        await oldPerm.save();
        log(`✅ Successfully renamed to '${newName}'`);
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
