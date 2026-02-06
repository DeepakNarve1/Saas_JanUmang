const mongoose = require("mongoose");

const sidebarAccessSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    paths: {
      type: [String],
      default: [],
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SidebarAccess", sidebarAccessSchema);
