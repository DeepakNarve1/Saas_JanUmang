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

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
      default: null,
    },
  },
  { timestamps: true },
);

boothSchema.index({ code: 1, block: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Booth", boothSchema);
