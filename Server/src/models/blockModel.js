const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Block Name is required"],
      trim: true,
      index: true,
    },
    year: {
      type: String,
      trim: true,
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
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
      default: null,
    },
  },
  { timestamps: true },
);

// Cascade delete booths when a block is deleted
blockSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const Booth = mongoose.model("Booth");
    const booths = await Booth.find({ block: this._id });
    for (const booth of booths) {
      await booth.deleteOne();
    }
  },
);

module.exports = mongoose.model("Block", blockSchema);
