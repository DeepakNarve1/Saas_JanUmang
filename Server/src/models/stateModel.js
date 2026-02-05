const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "State name is required"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Cascade delete divisions when a state is deleted
stateSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    const Division = mongoose.model("Division");
    const divisions = await Division.find({ state: this._id });
    for (const division of divisions) {
      await division.deleteOne();
    }
  }
);

module.exports = mongoose.model("State", stateSchema);
