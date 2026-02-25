const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Permission Name is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    displayName: {
      type: String,
      required: [true, "Display Name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ============================================
    // MODULE ASSOCIATION (NEW - CRITICAL)
    // ============================================
    module: {
      type: String,
      required: [true, "Module is required"],
      lowercase: true,
      index: true,
      description:
        "Module this permission belongs to (e.g., 'mp_public_problems', 'projects')",
    },

    // ============================================
    // PERMISSION CATEGORY
    // ============================================
    category: {
      type: String,
      enum: ["view", "create", "edit", "delete", "export", "manage", "other"],
      default: "other",
      description: "Type of action this permission grants",
    },

    // ============================================
    // STATUS
    // ============================================
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Permission", permissionSchema);
