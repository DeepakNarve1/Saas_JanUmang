const mongoose = require("mongoose");

const panchayatSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Panchayat name is required"],
      trim: true,
      index: true,
    },

    // SaaS Multi-tenancy
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
      default: null,
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

// Compound index for uniqueness within a tenant
panchayatSchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Panchayat", panchayatSchema);
