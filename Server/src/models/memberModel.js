const mongoose = require("mongoose");

const memberSchema = mongoose.Schema(
  {
    addedBy: {
      type: String,
      trim: true,
      default: "",
    },
    district: {
      type: String,
      trim: true,
      default: "",
    },
    samiti: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    block: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    boothName: {
      type: String,
      trim: true,
      default: "",
    },
    boothNumber: {
      type: String,
      trim: true,
      default: "",
    },
    grampanchayat: {
      type: String,
      trim: true,
      default: "",
    },
    village: {
      type: String,
      trim: true,
      default: "",
    },
    toll: {
      type: String,
      trim: true,
      default: "",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
      default: "",
    },
    jaati: {
      type: String,
      trim: true,
      default: "",
    },
    dob: {
      type: Date,
    },
    age: {
      type: Number,
      default: 0,
    },
    dom: {
      type: Date,
    },
    education: {
      type: String,
      trim: true,
      default: "",
    },
    mobile: {
      type: String,
      trim: true,
      default: "",
    },
    voterId: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      trim: true,
      default: "",
    },
    group: {
      type: String,
      trim: true,
      default: "",
    },
    vehicle: {
      type: String,
      trim: true,
      default: "",
    },
    govtEmployee: {
      type: String,
      trim: true,
      default: "",
    },
    party: {
      type: String,
      trim: true,
      default: "",
    },
    postYear: {
      type: String,
      trim: true,
      default: "",
    },
    code: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    nariSammanYojna: {
      type: String,
      trim: true,
      default: "",
    },
    farmerLoanWaiver: {
      type: String,
      trim: true,
      default: "",
    },
    facebook: {
      type: String,
      trim: true,
      default: "",
    },
    instagram: { type: String, default: "", trim: true },
    twitter: { type: String, default: "", trim: true },
    image: { type: String, default: "" }, // URL or Base64
    reference: { type: String, default: "", trim: true },
    remark: { type: String, default: "", trim: true },
    startLat: { type: Number, default: 0 },
    startLong: { type: Number, default: 0 },
    startDate: { type: Date },
    endLat: { type: Number, default: 0 },
    endLong: { type: Number, default: 0 },
    endDate: { type: Date },
  },
  {
    timestamps: true,
  },
);

memberSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Member", memberSchema);
