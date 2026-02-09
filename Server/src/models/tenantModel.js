const mongoose = require("mongoose");

const tenantSchema = new mongoose.Schema(
  {
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
    plan: {
      type: String,
      enum: ["Basic", "Pro", "Enterprise"],
      default: "Basic",
    },
    maxUsers: {
      type: Number,
      default: 5, // Default limit for Basic plan
    },
    status: {
      type: String,
      enum: ["active", "suspended", "trialing"],
      default: "trialing",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    settings: {
      theme: {
        primaryColor: { type: String, default: "#008080" }, // Default Teal
        logoUrl: { type: String, default: "" },
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
