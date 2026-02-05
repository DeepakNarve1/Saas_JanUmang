const mongoose = require("mongoose");

const parliamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Division",
    required: true,
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
  },
});

// Cascade delete assemblies when a parliament is deleted
parliamentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const Assembly = mongoose.model("Assembly");
    const assemblies = await Assembly.find({ parliament: this._id });
    for (const assembly of assemblies) {
      await assembly.deleteOne();
    }
  }
);

module.exports = mongoose.model("Parliament", parliamentSchema);
