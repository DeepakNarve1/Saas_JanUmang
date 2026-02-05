const mongoose = require("mongoose");

const panchayatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Panchayat name is required"],
      trim: true,
      index: true,
    },

    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      index: true,
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
      index: true,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      index: true,
    },
    parliament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parliament",
      index: true,
    },
    assembly: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assembly",
      index: true,
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: [true, "Block is required"],
      index: true,
    },
    booth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booth",
      required: [true, "Booth is required"],
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Panchayat", panchayatSchema);
