const mongoose = require("mongoose");

const boothSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Booth name is required"],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    year: {
      type: String,
      trim: true,
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
    parliament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parliament",
    },
    assembly: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assembly",
    },
  },
  { timestamps: true },
);

boothSchema.index({ block: 1, code: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Booth", boothSchema);
