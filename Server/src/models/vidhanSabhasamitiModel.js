const mongoose = require("mongoose");

const samitiSchema = mongoose.Schema(
  {
    samitiType: { type: String, required: true }, // informative
    uniqueId: { type: String, index: true },
    name: { type: String }, // General Name (added for Legislative/Other types)
    type: { type: String }, // Sub-type (e.g. Financial, Standing)
    year: { type: String },
    acMpNo: { type: String, default: "N/A" },
    block: { type: String },
    sector: { type: String },
    microSectorNo: { type: String },
    microSectorName: { type: String },
    boothName: { type: String },
    boothNo: { type: String },
    gramPanchayat: { type: String },
    village: { type: String },
    faliya: { type: String },

    // Bhagoria Specific
    date: { type: String },
    day: { type: String },
    bhagoriaHat: { type: String },
    numberOfDol: { type: String },
    inChargeName: { type: String },
    mobileNumber: { type: String },
    remark: { type: String },
    image: { type: String },

    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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

// Pre-save hook to auto-generate uniqueId
samitiSchema.pre("save", async function () {
  if (!this.uniqueId) {
    const count = await this.constructor.countDocuments({
      samitiType: this.samitiType,
      tenantId: this.tenantId,
    });
    const prefix = this.samitiType
      ? this.samitiType.substring(0, 3).toUpperCase()
      : "VS";
    this.uniqueId = `${prefix}/${count + 1}`;
  }
});

samitiSchema.index({ uniqueId: 1, tenantId: 1 }, { unique: true });

const getSamitiModel = (samitiType) => {
  const modelMap = {
    "ganesh-samiti": "GaneshSamiti",
    "tenkar-samiti": "TenkarSamiti",
    "dp-samiti": "DpSamiti",
    "mandir-samiti": "MandirSamiti",
    "bhagoria-samiti": "BhagoriaSamiti",
    "nirman-samiti": "NirmanSamiti",
    "booth-samiti": "BoothSamiti",
    "block-samiti": "BlockSamiti",
  };

  const modelName = modelMap[samitiType];

  if (!modelName) {
    throw new Error(`Invalid samiti type: ${samitiType}`);
  }

  // Check if model already exists to prevent OverwriteModelError
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  // Use dot notation to create a 'folder' structure in MongoDB GUIs (e.g., MongoDB Compass)
  // Collection name: vidhasabha.ganesh_samitis
  const collectionName = `vidhasabha.${samitiType.replace("-", "_")}s`;

  return mongoose.model(modelName, samitiSchema, collectionName);
};

module.exports = getSamitiModel;
