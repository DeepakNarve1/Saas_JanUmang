const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    district: {
      type: String, // Ideally ObjectId if possible, but adhering to existing pattern as String
      required: [true, "District is required"],
      trim: true,
      index: true,
    },
    block: {
      type: String,
      required: [true, "Block is required"],
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      index: true,
    },
    workName: {
      type: String,
      required: [true, "Work Name is required"],
      trim: true,
      index: true,
    },
    projectCost: {
      type: Number,
      required: [true, "Project Cost is required"],
      default: 0,
    },
    proposalEstimate: {
      type: Number,
      required: [true, "Proposal Estimate is required"],
      default: 0,
    },
    tsNoDate: {
      type: String,
      default: "",
      trim: true,
    },
    asNoDate: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
      index: true,
    },
    officerName: {
      type: String,
      default: "",
      trim: true,
    },
    contactNumber: {
      type: String,
      default: "",
      trim: true,
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    currentProgress: {
      type: String,
      default: "",
      trim: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Project", projectSchema);
