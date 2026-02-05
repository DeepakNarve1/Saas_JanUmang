const mongoose = require("mongoose");

const vidhanSabhaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    year: {
      type: Number,
      required: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    addedBy: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("VidhanSabha", vidhanSabhaSchema);
