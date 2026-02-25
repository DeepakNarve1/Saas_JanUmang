const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      trim: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: [true, "Display name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ============================================
    // TENANT ISOLATION (CRITICAL)
    // ============================================
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: function () {
        // Required for all roles except system_admin
        return this.level !== "system_admin";
      },
      index: true,
    },

    // ============================================
    // ROLE LEVEL
    // ============================================
    level: {
      type: String,
      enum: ["system_admin", "tenant_admin", "custom"],
      default: "custom",
      description:
        "system_admin: Super admin, tenant_admin: Org admin, custom: Regular role",
    },

    // ============================================
    // PERMISSIONS & MODULE ACCESS
    // ============================================
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    // Track which modules this role has permissions for
    modules: [
      {
        type: String,
        lowercase: true,
      },
    ],

    sidebarAccess: {
      type: [String], // Array of strings for sidebar paths
      default: [],
    },

    // ============================================
    // STATUS & FLAGS
    // ============================================
    isSystem: {
      type: Boolean,
      default: false,
      description: "System roles like superadmin cannot be deleted",
    },
    isDefault: {
      type: Boolean,
      default: false,
      description: "Auto-assign this role to new users in the tenant",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // METADATA
    // ============================================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

roleSchema.index(
  { name: 1, tenantId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

module.exports = mongoose.model("Role", roleSchema);
