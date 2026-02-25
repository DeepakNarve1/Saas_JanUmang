const mongoose = require("mongoose");

const dispatchRegisterSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    year: {
      type: String,
      required: [true, "Year is required"],
      trim: true,
    },
    month: {
      type: String,
      required: [true, "Month is required"],
      trim: true,
    },
    portalNo: {
      type: String,
      trim: true,
    },
    samitiNo: {
      type: String,
      trim: true,
    },
    dispatchNo: {
      type: String,
      required: [true, "Dispatch No is required"],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
    particulars: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Block",
    },
    panchayat: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Panchayat",
      },
    ],
    village: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Village",
      },
    ],
    uploadLetter: {
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

dispatchRegisterSchema.index({ createdAt: -1 });
dispatchRegisterSchema.index({ tenantId: 1, createdAt: -1 });
dispatchRegisterSchema.index({ date: -1 });

module.exports = mongoose.model("DispatchRegister", dispatchRegisterSchema);
