const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
      index: true,
    },
    vidhansabha: {
      type: String,
      required: [true, "Vidhansabha is required"],
      trim: true,
    },
    block: {
      type: String,
      required: [true, "Block is required"],
      trim: true,
      index: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    post: {
      type: String,
      required: [true, "Post is required"],
      trim: true,
    },
    place: {
      type: String,
      required: [true, "Place is required"],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, "Mobile Number is required"],
      trim: true,
      index: true,
    },
    incomingVisitor: {
      type: String,
      enum: ["INCOMING", "VISITOR"],
      required: [true, "Incoming/Visitor type is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    visitorType: {
      type: String,
      required: [true, "Visitor Type is required"],
      trim: true,
    },
    attendBy: {
      type: String,
      required: [true, "Attend By is required"],
      trim: true,
    },
    remarks: {
      type: String,
      required: [true, "Remarks are required"],
      trim: true,
    },
    bhaiyakanirdesh: {
      type: String,
      required: [true, "Bhaiya Ka Nirdesh is required"],
      trim: true,
    },
    addedBy: {
      type: String,
      required: [true, "Added By is required"],
      trim: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Visitor", visitorSchema);
