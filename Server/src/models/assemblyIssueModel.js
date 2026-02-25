const mongoose = require("mongoose");

const assemblyIssueSchema = mongoose.Schema(
  {
    uniqueId: {
      type: String,
      index: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      trim: true,
    },
    recommendedLetterNo: {
      type: String,
      trim: true,
    },
    acMpNo: {
      type: String,
      default: "N/A",
      trim: true,
    },
    acMpNo: {
      type: String,
      trim: true,
      default: "N/A",
    },
    block: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    sectorName: {
      type: String,
      trim: true,
    },
    microSectorNo: {
      type: String,
      trim: true,
    },
    microSectorName: {
      type: String,
      trim: true,
    },
    boothName: {
      type: String,
      trim: true,
      index: true,
    },
    boothNo: {
      type: String,
      trim: true,
    },
    panchayatName: {
      type: String,
      trim: true,
      index: true,
    },
    village: {
      type: String,
      trim: true,
      index: true,
    },
    majraFaliya: {
      type: String,
      trim: true,
    },
    workProblem: {
      type: String,
      trim: true,
    },
    office: {
      type: String,
      trim: true,
    },
    approximateCost: {
      type: Number,
      default: 0,
    },
    department: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      trim: true,
    },
    tsNoDate: {
      type: String,
      trim: true,
    },
    asNoDate: {
      type: String,
      trim: true,
    },
    typeOfWork: {
      type: String,
      trim: true,
    },
    subWorkType: {
      type: String,
      trim: true,
    },
    middleMen: {
      type: String,
      trim: true,
    },
    middleManContact: {
      type: String,
      trim: true,
    },
    beneficiaryName: {
      type: String,
      trim: true,
    },
    beneficiaryContact: {
      type: String,
      trim: true,
    },
    po: {
      type: String,
      trim: true,
    },
    avedanFile: {
      type: String,
    },
    avedanFileName: {
      type: String,
    },
    accountDetails: {
      type: String,
      trim: true,
    },
    adharCardNumber: {
      type: String,
      trim: true,
    },
    ifscNumber: {
      type: String,
      trim: true,
    },
    documentFile: {
      type: String,
    },
    documentFileName: {
      type: String,
    },
    remarkGoshana: {
      type: String,
      trim: true,
    },
    remarkTipUsd: {
      type: String,
      trim: true,
    },
    latLng: {
      type: String,
      trim: true,
    },
    registrationDate: {
      type: String,
      trim: true,
    },
    district: {
      type: String,
      trim: true,
    },
    assembly: {
      type: String,
      trim: true,
    },
    totalMembers: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Pending",
      trim: true,
    },
    addedBy: {
      type: String,
      trim: true,
    },
    issueType: {
      type: String,
      default: "assembly-issue",
      trim: true,
      index: true,
    },
    file: { type: String }, // For file path or URL
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook to generate uniqueId
assemblyIssueSchema.pre("save", async function () {
  if (!this.uniqueId) {
    const type = this.issueType || "assembly-issue";
    const prefix =
      type === "assembly-issue"
        ? "GS"
        : type === "myassembly0"
          ? "MY0"
          : type === "myassembly2"
            ? "MY2"
            : "MY3";

    const count = await this.constructor.countDocuments({
      issueType: type,
      tenantId: this.tenantId,
    });
    this.uniqueId = `${prefix}/${170 + count + 1}`;
  }
});

assemblyIssueSchema.index({ createdAt: -1 });
assemblyIssueSchema.index({ tenantId: 1, createdAt: -1 });
assemblyIssueSchema.index({ uniqueId: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("AssemblyIssue", assemblyIssueSchema);
