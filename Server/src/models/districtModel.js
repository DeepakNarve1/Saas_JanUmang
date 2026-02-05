const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "District name is required"],
      unique: true,
      trim: true,
      index: true,
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
      required: [true, "Division is required"],
      index: true,
    },
  },
  { timestamps: true }
);

// Cascade delete parliaments when a district is deleted
districtSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // No explicit cascade defined
  }
);

module.exports = mongoose.model("District", districtSchema);
