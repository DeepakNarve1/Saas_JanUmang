const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, "Please add an organization name"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Please add a unique slug"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // Contact Information
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    // ============================================
    // MODULE ACCESS CONTROL (NEW)
    // ============================================
    plan: {
      type: String,
      default: "basic",
      lowercase: true,
    },

    // List of enabled module IDs
    enabledModules: [
      {
        type: String,
        lowercase: true,
      },
    ],

    // Module-specific settings (optional)
    moduleSettings: {
      type: Map,
      of: {
        enabled: { type: Boolean, default: true },
        maxRecords: { type: Number }, // Optional record limits per module
        features: [String], // Sub-features within module
      },
      default: new Map(),
    },

    // ============================================
    // SUBSCRIPTION & BILLING
    // ============================================
    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "suspended", "cancelled", "expired"],
      default: "trial",
    },
    subscriptionStartDate: {
      type: Date,
      default: Date.now,
    },
    subscriptionEndDate: {
      type: Date,
    },
    // ─── Razorpay Billing ──────────────────────────────────────────────────────
    razorpayCustomerId: {
      type: String,
      index: true,
      sparse: true,
    },
    razorpaySubscriptionId: {
      type: String,
      index: true,
      sparse: true,
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },

    // ============================================
    // RESOURCE LIMITS
    // ============================================
    maxUsers: {
      type: Number,
      default: 10,
    },
    maxStorage: {
      type: Number, // in MB
      default: 1024, // 1 GB
    },
    currentStorage: {
      type: Number,
      default: 0,
    },

    // ============================================
    // STATUS & OWNERSHIP
    // ============================================
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "trialing"],
      default: "active",
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ============================================
    // CUSTOMIZATION
    // ============================================
    settings: {
      theme: {
        primaryColor: { type: String, default: "#008080" },
        logoUrl: { type: String, default: "" },
      },
      features: {
        allowUserRegistration: { type: Boolean, default: false },
        requireEmailVerification: { type: Boolean, default: true },
      },
    },
  },
  { timestamps: true },
);

// Pre-save hook to ensure slug is URL-friendly if not already
tenantSchema.pre("validate", async function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
});

module.exports = mongoose.model("Tenant", tenantSchema);
