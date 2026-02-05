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
  },
  { timestamps: true }
);

module.exports = mongoose.model("SidebarAccess", sidebarAccessSchema);

