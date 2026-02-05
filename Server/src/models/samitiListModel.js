const mongoose = require("mongoose");

// Simple Samiti Model as requested (Just Name)
const samitiListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Samiti Name is required"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SamitiList", samitiListSchema);
