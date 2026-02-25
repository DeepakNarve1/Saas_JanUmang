const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Hardcoded URI as requested in previous contexts, or from env if available
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://deepaknarve4_db_user:74r3VXuvKUOH9AnD@cluster0.f6zwzos.mongodb.net/?appName=Cluster0";

// --- Schemas (Minimal for script) ---
const permissionSchema = new mongoose.Schema({
  name: String,
  displayName: String,
});
const Permission =
  mongoose.models.Permission || mongoose.model("Permission", permissionSchema);

const roleSchema = new mongoose.Schema({
  name: String,
  displayName: String,
  level: String,
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
  sidebarAccess: [String],
  isSystem: Boolean,
  tenantId: mongoose.Schema.Types.ObjectId,
});
const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, required: true },
  role: mongoose.Schema.Types.Mixed,
  level: String,
  userType: String,
  tenantId: mongoose.Schema.Types.ObjectId,
});

// Add hashing middleware for script use
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const SYSTEM_ADMIN_EMAIL = "devintern@akalptechnomediasolutions.com";
const SYSTEM_ADMIN_PASS = "Admin@123"; // Default password

async function seedSystemAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    // 1. Get ALL Permissions
    const allPermissions = await Permission.find({});
    console.log(`Found ${allPermissions.length} permissions in total.`);
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
        sidebarAccess: ["*"], // Full access
        isSystem: true,
        // tenantId is optional for system_admin
      });
      console.log(`✅ Role Created: ${sysAdminRole._id}`);
    } else {
      console.log("Updating 'system_admin' Role permissions...");
      sysAdminRole.permissions = allPermIds;
      sysAdminRole.sidebarAccess = ["*"];
      await sysAdminRole.save();
      console.log(`✅ Role Updated: ${sysAdminRole._id}`);
    }

    // 3. Create/Update System Admin User
    let user = await User.findOne({ email: SYSTEM_ADMIN_EMAIL });

    if (!user) {
      console.log(`Creating User '${SYSTEM_ADMIN_EMAIL}'...`);
      user = new User({
        name: "System Admin",
        email: SYSTEM_ADMIN_EMAIL,
        password: SYSTEM_ADMIN_PASS,
        role: sysAdminRole._id,
        level: "system_admin",
        userType: "superadmin", // or system_admin
        // tenantId: explicit null or undefined for system admin
      });
      await user.save();
      console.log(`✅ User Created Successfully!`);
      console.log(`📧 Email: ${SYSTEM_ADMIN_EMAIL}`);
      console.log(`🔑 Password: ${SYSTEM_ADMIN_PASS}`);
    } else {
      console.log(`User '${SYSTEM_ADMIN_EMAIL}' exists. Updating...`);
      user.role = sysAdminRole._id;
      user.level = "system_admin";
      user.userType = "superadmin";
      // Optional: Reset password if needed, but let's keep it if existing
      // user.password = SYSTEM_ADMIN_PASS;
      await user.save();
      console.log(`✅ User Updated.`);
    }

    console.log("Done.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seedSystemAdmin();
