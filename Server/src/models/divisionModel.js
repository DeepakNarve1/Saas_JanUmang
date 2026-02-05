const mongoose = require("mongoose");

const divisionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Division name is required"],
      trim: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State is required"],
    },
  },
  { timestamps: true }
);

divisionSchema.index({ name: 1, state: 1 }, { unique: true });

divisionSchema.index({ state: 1 });

// Cascade delete districts and parliaments when a division is deleted
divisionSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    // Delete associated Districts
    const District = mongoose.model("District");
    const districts = await District.find({ division: this._id });
    for (const district of districts) {
      await district.deleteOne();
    }

    // Delete associated Parliaments
    const Parliament = mongoose.model("Parliament");
    const parliaments = await Parliament.find({ division: this._id });
    for (const parliament of parliaments) {
      await parliament.deleteOne();
    }
  }
);

module.exports = mongoose.model("Division", divisionSchema);
