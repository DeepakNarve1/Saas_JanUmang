const mongoose = require("mongoose");

const partySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
    },
    symbol: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["National", "State", "Regional", "Independent"],
      default: "State",
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

module.exports = mongoose.model("Party", partySchema);
