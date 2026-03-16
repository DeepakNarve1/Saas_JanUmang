const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    planId: {
      type: String,
      required: [true, "Plan ID is required (e.g., 'basic')"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    priceMonthlyPaise: {
      type: Number,
      required: [true, "Monthly price in paise is required"],
    },
    priceYearlyPaise: {
      type: Number,
      required: [true, "Yearly price in paise is required"],
    },
    razorpayPlanIdMonthly: {
      type: String,
      trim: true,
      default: "",
    },
    razorpayPlanIdYearly: {
      type: String,
      trim: true,
      default: "",
    },
    maxUsers: {
      type: Number,
      default: 10, // -1 for unlimited
    },
    maxStorage: {
      type: Number,
      default: 5120, // MB, -1 for unlimited
    },
    enabledModules: [
      {
        type: String, // Module IDs from modules.js
      },
    ],
    features: [
      {
        type: String,
      },
    ],
    color: {
      type: String,
      default: "#008080",
    },
    icon: {
      type: String,
      default: "Layers", // default lucide icon name
    },
    highlighted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
