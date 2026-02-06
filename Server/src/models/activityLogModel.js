const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Can be null for system actions or failed logins if we track them
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "CREATE",
        "UPDATE",
        "DELETE",
        "VIEW",
        "EXPORT",
        "PRINT",
        "OTHER",
      ],
      index: true,
    },
    module: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, // For storing extra details like record ID, changed fields, etc.
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

// Compound index for filtering
activityLogSchema.index({ user: 1, action: 1, module: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
