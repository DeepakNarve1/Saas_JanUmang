const mongoose = require("mongoose");

// Simple Samiti Model as requested (Just Name)
const samitiListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Samiti Name is required"],
      trim: true,
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

samitiListSchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("SamitiList", samitiListSchema);
