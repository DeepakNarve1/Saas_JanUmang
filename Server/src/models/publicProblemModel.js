const mongoose = require("mongoose");

const publicProblemSchema = mongoose.Schema(
  {
    regNo: {
      type: String,
      required: true,
      index: true,
    },
    srNo: { type: String, default: "" },
    timer: { type: String, default: "" },
    year: { type: String, required: true },
    month: { type: String, required: true },
    dateString: { type: String }, // Stored as DD-MM-YYYY or Date string

    district: { type: String, default: "" },
    assembly: { type: String, default: "" },
    block: { type: String, default: "" },
    recommendedLetterNo: { type: String, default: "" },

    boothNo: { type: String, default: "" },
    boothName: { type: String, default: "" },
    panchayatName: { type: String, default: "" },
    village: { type: String, default: "" },
    majraFaliya: { type: String, default: "" },

    workProblem: { type: String, default: "" },
    office: { type: String, default: "" },
    approximateCost: { type: String, default: "" },
    department: { type: String, default: "" },
    priority: { type: String, default: "" },
    typeOfWork: { type: String, default: "" },

    middleMen: { type: String, default: "" },
    middleMenContactNo: { type: String, default: "" }, // Contact No for Middle Man

    beneficialName: { type: String, default: "" }, // Beneficial
    beneficialMobile: { type: String, default: "" }, // Beneficial Mobile / Beneficial Cont No.

    status: { type: String, default: "Pending", index: true },
    remarkGoshana: { type: String, default: "" },
    remarkTipUsd: { type: String, default: "" },

    addedBy: { type: String, default: "System" },

    startLat: { type: Number, default: 0 },
    startLong: { type: Number, default: 0 },

    savedAt: { type: Date, default: Date.now }, // Registration Date
    avedan: { type: String, default: "" }, // File URL

    submissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

publicProblemSchema.index({ createdAt: -1 });
publicProblemSchema.index({ tenantId: 1, createdAt: -1 });
publicProblemSchema.index({ regNo: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("PublicProblem", publicProblemSchema);
