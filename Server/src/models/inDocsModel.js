const mongoose = require("mongoose");

const inDocsSchema = new mongoose.Schema(
  {
    issueNo: {
      type: String,
      required: [true, "Issue No is required"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    nameAddress: {
      type: String,
      required: [true, "Name & Address is required"],
      trim: true,
    },
    place: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    documentsCount: {
      type: String, // Keeping as String for flexibility (e.g. "1+2")
      trim: true,
    },
    referenceIssueNo: {
      type: String,
      trim: true,
    },
    receivedIssueNo: {
      type: String,
      trim: true,
    },
    fileHeadNo: {
      type: String,
      trim: true,
    },
    stampReceived: {
      type: String, // Keeping as string to handle "200/-" formats if user enters symbols
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

module.exports = mongoose.model("InDocs", inDocsSchema);
