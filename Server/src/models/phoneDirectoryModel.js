const mongoose = require("mongoose");

const phoneDirectorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    post: {
      type: String,
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
    },
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
    },
    number: {
      type: String,
      required: [true, "Number is required"],
      trim: true,
    },
    alternateNumber: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    remark: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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

module.exports = mongoose.model("PhoneDirectory", phoneDirectorySchema);
