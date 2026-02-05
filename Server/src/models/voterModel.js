const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    fatherName: {
      type: String,
      required: [true, "Father Name is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile Number is required"],
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
    },
    cast: {
      type: String,
      trim: true,
    },
    subcast: {
      type: String,
      trim: true,
    },
    fulladdress: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: [true, "State is required"],
    },
    division: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Division",
      required: [true, "Division is required"],
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      required: [true, "District is required"],
    },
    parliament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parliament",
      required: [true, "Parliament is required"],
    },
    assembly: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assembly",
      required: [true, "Assembly is required"],
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
      required: [true, "Block is required"],
    },
    panchayat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Panchayat",
      required: [true, "Panchayat is required"],
    },
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: [true, "Village is required"],
    },
    booth: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booth",
      required: [true, "Booth is required"],
    },
    boothno: {
      type: String,
      trim: true,
    },
    fallaMarjra: {
      type: String,
      trim: true,
    },
    voterId: {
      type: String,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    source: {
      type: String,
      enum: ["LEGACY", "NEW"],
      default: "NEW",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Voter", voterSchema);
