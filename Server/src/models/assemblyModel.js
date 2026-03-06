const mongoose = require("mongoose");

const assemblySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "State",
    required: true,
  },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
  },
  parliament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parliament",
    required: true,
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tenant",
    index: true,
    default: null,
  },
});

// Cascade delete blocks when an assembly is deleted
assemblySchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const Block = mongoose.model("Block");
    const blocks = await Block.find({ assembly: this._id });
    for (const block of blocks) {
      await block.deleteOne();
    }
  },
);

module.exports = mongoose.model("Assembly", assemblySchema);
