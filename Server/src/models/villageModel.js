const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Village name is required"],
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
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: [true, "Panchayat is required"],
      index: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

// Prevent duplicate villages in same block
villageSchema.index({ name: 1, block: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Village", villageSchema);
