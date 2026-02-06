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
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    sidebarAccess: {
      type: [String], // Array of strings for sidebar paths
      default: [],
    },
    isSystem: {
      type: Boolean,
      default: false,
      // description option is valid for documentation/plugins, not core mongoose validation but benign
      description: "System roles like superadmin cannot be deleted",
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
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
    },
  },
  { timestamps: true },
);

roleSchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Role", roleSchema);
