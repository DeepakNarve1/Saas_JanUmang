const mongoose = require("mongoose");

const worktypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Worktype name is required"],
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Worktype", worktypeSchema);
