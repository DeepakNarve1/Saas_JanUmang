const mongoose = require("mongoose");

const inwardRegisterSchema = new mongoose.Schema(
  {
    issueNo: {
      type: String,
      required: [true, "Issue No is required"],
      trim: true,
    },
    issueDate: {
      type: Date,
      required: [true, "Issue Date is required"],
    },
    letterName: {
      type: String,
      required: [true, "Letter Name is required"],
      trim: true,
    },
    letterReceivedDate: {
      type: Date,
      required: [true, "Letter Received Date is required"],
    },
    fromWhomReceived: {
      type: String,
      required: [true, "From Whom Received is required"],
      trim: true,
    },
    letterDescription: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    fileNo: {
      type: String,
      trim: true,
    },
    receivedLetterNumber: {
      type: String,
      trim: true,
    },
    receivedLetterDate: {
      type: Date,
    },
    attachment: {
      type: String,
      trim: true,
    },
    replyToNumber: {
      type: String,
      trim: true,
    },
    replyToDate: {
      type: Date,
    },
    ourReplyNumber: {
      type: String,
      trim: true,
    },
    ourReplyDate: {
      type: Date,
    },
    forwardedLetterNumber: {
      type: String,
      trim: true,
    },
    forwardedLetterDate: {
      type: Date,
    },
    section: {
      type: String,
      trim: true,
    },
    signedDate: {
      type: Date,
    },
    sentTo: {
      type: String,
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

inwardRegisterSchema.index({ createdAt: -1 });
inwardRegisterSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model("InwardRegister", inwardRegisterSchema);
