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

const roleSchema = new mongoose.Schema(
  {
    name: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  },
  { strict: false },
);
const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

async function mergeAndFix() {
  try {
    log("Connecting...");
    await mongoose.connect(MONGO_URI);
    log("✅ Connected");

    const pairs = [
      {
        old: "view_panchayat",
        new: "view_panchayats",
        disp: "View Panchayats",
      },
      {
        old: "create_panchayat",
        new: "create_panchayats",
        disp: "Create Panchayats",
      },
      {
        old: "edit_panchayat",
        new: "edit_panchayats",
        disp: "Edit Panchayats",
      },
      {
        old: "delete_panchayat",
        new: "delete_panchayats",
        disp: "Delete Panchayats",
      },
    ];

    for (const p of pairs) {
      log(`\nProcessing ${p.old} -> ${p.new}...`);

      const oldPerm = await Permission.findOne({ name: p.old });
      const newPerm = await Permission.findOne({ name: p.new });

      if (!oldPerm && !newPerm) {
        log(`- Neither found. Creating ${p.new}...`);
        const created = await Permission.create({
          name: p.new,
          displayName: p.disp,
          category: "panchayats",
        });
        log(`  Created ${created._id}`);
        continue;
      }

      if (oldPerm && !newPerm) {
        log(`- Found Old (${oldPerm._id}), New missing. Renaming...`);
        oldPerm.name = p.new;
        if (oldPerm.displayName && !oldPerm.displayName.endsWith("s"))
          oldPerm.displayName += "s";
        await oldPerm.save();
        log(`  Renamed to ${p.new}`);
        continue;
      }

      if (!oldPerm && newPerm) {
        log(`- Only New found (${newPerm._id}). Good.`);
        continue;
      }

      if (oldPerm && newPerm) {
        log(
          `- BOTH found! Merging roles from Old (${oldPerm._id}) to New (${newPerm._id})...`,
        );

        const roles = await Role.find({ permissions: oldPerm._id });
        log(`  Found ${roles.length} roles with Old permission.`);

        for (const r of roles) {
          // Add New if not present
          const pids = r.permissions.map((id) => id.toString());
          if (!pids.includes(newPerm._id.toString())) {
            r.permissions.push(newPerm._id);
          }
          // Remove Old
          r.permissions = r.permissions.filter(
            (id) => id.toString() !== oldPerm._id.toString(),
          );

          await r.save();
          log(`  Updated role ${r.name}`);
        }

        log(`  Deleting Old permission...`);
        await Permission.deleteOne({ _id: oldPerm._id });
        log(`  Deleted.`);
      }
    }

    // Final check for tenant_admin
    log("\nVerifying tenant_admin roles...");
    const taRoles = await Role.find({ name: "tenant_admin" }).populate(
      "permissions",
    );
    for (const r of taRoles) {
      log(`Role: ${r.name} (${r._id})`);
      const pnames = r.permissions.map((p) => p.name);
      log(
        `- Perms: ${pnames.filter((n) => n.includes("panchayat")).join(", ")}`,
      );

      // Ensure plural exist
      const plural = [
        "view_panchayats",
        "create_panchayats",
        "edit_panchayats",
        "delete_panchayats",
      ];
      const missing = plural.filter((n) => !pnames.includes(n));

      if (missing.length > 0) {
        log(`- MISSING: ${missing.join(", ")}. Fixing...`);
        const missingPerms = await Permission.find({ name: { $in: missing } });
        missingPerms.forEach((mp) => r.permissions.push(mp._id));
        await r.save();
        log(`  Added missing permissions.`);
      }
    }

    log("Done.");
    process.exit(0);
  } catch (e) {
    log("❌ Error: " + e.stack);
    process.exit(1);
  }
}

mergeAndFix();
