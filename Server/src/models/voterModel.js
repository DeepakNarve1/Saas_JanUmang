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
      type: String,
      required: [true, "Village is required"],
      trim: true,
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
      index: true,
      trim: true,
    },
    uniqueId: {
      type: String,
      index: true,
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
      index: true,
    },

    source: {
      type: String,
      enum: ["LEGACY", "NEW"],
      default: "NEW",
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

voterSchema.index({ createdAt: -1 });
voterSchema.index({ tenantId: 1, createdAt: -1 });
voterSchema.index({ district: 1 });
voterSchema.index({ block: 1 });
voterSchema.index({ panchayat: 1 });
voterSchema.index({ booth: 1 });
voterSchema.index({ voterId: 1, tenantId: 1 }, { unique: true });
voterSchema.index({ uniqueId: 1, tenantId: 1 }, { unique: true });

// Pre-save hook to generate uniqueId
voterSchema.pre("save", async function () {
  if (this.isNew && !this.uniqueId) {
    const prefix = "VOTER"; // Or any other desired prefix
    const count = await this.constructor.countDocuments({
      tenantId: this.tenantId,
    });
    this.uniqueId = `${prefix}/${1000 + count + 1}`; // Starting from 1001
  }
});

module.exports = mongoose.model("Voter", voterSchema);
