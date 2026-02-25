const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected successfully");

    // Define schemas inline
    const permissionSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        displayName: { type: String },
        description: { type: String },
        module: { type: String },
        category: { type: String },
      },
      { timestamps: true },
    );

    const roleSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        permissions: [
          { type: mongoose.Schema.Types.ObjectId, ref: "Permission" },
        ],
        level: { type: String },
        sidebarAccess: [String],
      },
      { timestamps: true, strict: false },
    );

    const Permission =
      mongoose.models.Permission ||
      mongoose.model("Permission", permissionSchema);
    const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);

    // Fix permissions
    console.log("\n🔧 Fixing Admin Permissions...\n");

    const allPermissions = await Permission.find({}).select("_id name");
    const allPermissionIds = allPermissions.map((p) => p._id);
    console.log(`📦 Found ${allPermissionIds.length} total permissions`);

    const adminRoles = await Role.find({
      name: { $in: ["admin", "superadmin"] },
    });
    // Checking both admin and superadmin to ensure coverage

    if (adminRoles.length === 0) {
      console.log("⚠️ No role found with name 'admin' or 'superadmin'");
    } else {
      for (const role of adminRoles) {
        console.log(`\n👉 Updating role: ${role.name} (${role._id})`);
        role.permissions = allPermissionIds;
        // Check if we should elevate level
        if (role.name === "admin" || role.name === "superadmin") {
          role.level = "system_admin";
        }
        role.sidebarAccess = ["*"];
        await role.save();
        console.log(
          `   ✅ Permissions updated. Count: ${role.permissions.length}`,
        );
      }
    }

    console.log("\n✅ Admin permissions fixed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

connectDB();
