const mongoose = require("mongoose");

// Hardcoded URI
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

// Minimal Schemas
const PermissionSchema = new mongoose.Schema({
  name: String,
  displayName: String,
});
// Use existing model name to avoid overwriting model compilation error if already compiled
const Permission =
  mongoose.models.Permission || mongoose.model("Permission", PermissionSchema);

const RoleSchema = new mongoose.Schema(
  {
    name: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
    sidebarAccess: [String],
    tenantId: mongoose.Schema.Types.ObjectId,
    level: String,
  },
  { strict: false },
); // Loose checking
const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    level: String,
    userType: String,
    role: { type: mongoose.Schema.Types.Mixed }, // Can be string or ObjectId
    tenantId: mongoose.Schema.Types.ObjectId,
  },
  { strict: false },
);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

const TenantSchema = new mongoose.Schema(
  {
    name: String,
    enabledModules: [String],
  },
  { strict: false },
);
const Tenant = mongoose.models.Tenant || mongoose.model("Tenant", TenantSchema);

async function checkAccess() {
  try {
    console.log("Connecting...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("✅ Connected");

    const perm = await Permission.findOne({ name: "view_panchayats" });
    console.log(
      `Permission 'view_panchayats': ${perm ? perm._id : "NOT FOUND"}`,
    );

    // Get a variety of users
    const users = await User.find({}).limit(10); // Just grab 10 random ones to see what's out there

    console.log(`Checking sample users (${users.length}):`);

    for (const u of users) {
      // Skip system admins if we only care about regular users, but let's see global state
      console.log(`\n--------------------------------------------------`);
      console.log(`User: ${u.email} (Level: ${u.level}, Type: ${u.userType})`);
      console.log(`TenantId: ${u.tenantId}`);

      let t = null;
      if (u.tenantId) {
        t = await Tenant.findById(u.tenantId);
        if (t) {
          const mods = t.enabledModules || [];
          const hasPanchayats = mods.includes("panchayats");
          const hasPanchayat = mods.includes("panchayat");
          console.log(
            `- Tenant [${t.name}]: 'panchayats': ${hasPanchayats}, 'panchayat': ${hasPanchayat}`,
          );
        } else {
          console.log(`- Tenant not found!`);
        }
      }

      // Check Role Permissions
      if (typeof u.role === "string") {
        console.log(`- Role (String): ${u.role}`);
      } else if (u.role) {
        // It's an ObjectId or populated object?
        // In raw find without populate, it might be ID
        let roleId = u.role;
        if (u.role._id) roleId = u.role._id;

        if (mongoose.Types.ObjectId.isValid(roleId)) {
          const r = await Role.findById(roleId).populate("permissions");
          if (r) {
            console.log(`- Role (Doc): ${r.name}`);
            const perms = r.permissions.map((p) => p.name);
            const hasPerm = perms.includes("view_panchayats");
            console.log(`  Has 'view_panchayats'? ${hasPerm}`);

            if (r.sidebarAccess && r.sidebarAccess.length > 0) {
              const hasSidebar =
                r.sidebarAccess.includes("/panchayat") ||
                r.sidebarAccess.includes("*");
              console.log(`  Has Sidebar Access '/panchayat'? ${hasSidebar}`);
              if (!hasSidebar)
                console.log(`  Sidebar: ${r.sidebarAccess.join(", ")}`);
            } else {
              console.log(`  Sidebar Access: [Empty]`);
            }
          } else {
            console.log(`- Role Doc not found for ID: ${roleId}`);
          }
        } else {
          console.log(
            `- Role is object or invalid ID: ${JSON.stringify(u.role)}`,
          );
        }
      }
    }

    console.log("\nDone.");
    process.exit(0);
  } catch (e) {
    console.log("❌ Error: " + e.stack);
    process.exit(1);
  }
}

checkAccess();
