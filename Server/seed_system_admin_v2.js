const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Hardcoded URI for robust execution
const MONGO_URI =
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

// --- Schemas ---
const permissionSchema = new mongoose.Schema({
  name: String,
  displayName: String,
});
const Permission =
  mongoose.models.Permission || mongoose.model("Permission", permissionSchema);

const roleSchema = new mongoose.Schema(
  {
    name: String,
    displayName: String,
    level: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
    sidebarAccess: [String],
    isSystem: Boolean,
    tenantId: mongoose.Schema.Types.ObjectId,
  },
  { strict: false },
);
const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: { type: String, required: true },
    role: mongoose.Schema.Types.Mixed,
    level: String,
    userType: String,
    tenantId: mongoose.Schema.Types.ObjectId,
  },
  { strict: false },
);

// FIX: Do NOT define 'pre' middleware here if it conflicts or uses 'next' incorrectly with async/await.
// Just hash manually in the script.

const User = mongoose.models.User || mongoose.model("User", userSchema);

const SYSTEM_ADMIN_EMAIL = "devintern@akalptechnomediasolutions.com";
const SYSTEM_ADMIN_PASS = "Admin@123";

async function forceSeed() {
  try {
    console.log("Connecting...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    // 1. Get ALL Permissions
    const allPermissions = await Permission.find({});
    console.log(`Found ${allPermissions.length} permissions.`);
    const allPermIds = allPermissions.map((p) => p._id);

    // 2. Ensure 'system_admin' Role exists
    let sysAdminRole = await Role.findOne({ name: "system_admin" });

    if (!sysAdminRole) {
      console.log("Creating 'system_admin' Role...");
      sysAdminRole = await Role.create({
        name: "system_admin",
        displayName: "System Administrator",
        level: "system_admin",
        permissions: allPermIds,
        sidebarAccess: ["*"],
        isSystem: true,
      });
      console.log(`✅ Role Created: ${sysAdminRole._id}`);
    } else {
      console.log("Updating 'system_admin' Role...");
      sysAdminRole.permissions = allPermIds;
      sysAdminRole.sidebarAccess = ["*"];
      await sysAdminRole.save();
    }

    // 3. Create or Update User
    let user = await User.findOne({ email: SYSTEM_ADMIN_EMAIL });

    // Hash password manually to avoid middleware issues
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(SYSTEM_ADMIN_PASS, salt);

    if (!user) {
      console.log(`Creating User '${SYSTEM_ADMIN_EMAIL}'...`);
      // Use create/findByIdAndUpdate to bypass middleware issues if possible, or just new User()
      // Since we removed the schema middleware definition in this script context, it should depend on
      // if mongoose carried over the model definition.
      // To be safe, use updateOne to set properties directly if it existed, or create.

      const newUser = new User({
        name: "System Admin",
        email: SYSTEM_ADMIN_EMAIL,
        password: hashedPassword,
        role: sysAdminRole._id,
        level: "system_admin",
        userType: "superadmin",
      });

      // If the model was already compelled with hooks elsewhere in Memory, they might fire.
      // But usually in a standalone script, it's fresh.
      await newUser.save();
      console.log(`✅ User Created.`);
    } else {
      console.log(`User exists. Updating role and password...`);
      user.role = sysAdminRole._id;
      user.level = "system_admin";
      user.userType = "superadmin";
      user.password = hashedPassword; // Reset password to ensuring login works
      await user.save();
      console.log(`✅ User Updated.`);
    }

    console.log("Done.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

forceSeed();
