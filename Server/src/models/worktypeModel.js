const mongoose = require("mongoose");

const worktypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Worktype name is required"],
      trim: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

worktypeSchema.index({ name: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Worktype", worktypeSchema);
