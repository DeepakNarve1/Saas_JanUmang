const mongoose = require("mongoose");

const subTypeOfWorkSchema = new mongoose.Schema(
  {
    typeOfWork: {
      type: String,
      required: [true, "Type of Work is required"],
      trim: true,
    },
    subTypeOfWork: {
      type: String,
      required: [true, "Sub Type of Work is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubTypeOfWork", subTypeOfWorkSchema);
