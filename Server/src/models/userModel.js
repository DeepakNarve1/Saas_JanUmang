const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a Name"],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Please add an Email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      index: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a password"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "Please select a Role"],
    },
    mobile: {
      type: String,
      default: "",
      trim: true,
    },
    userType: {
      type: String,
      default: "regularUser",
      trim: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    // SaaS Hierarchy:
    // 1. system_admin / superadmin: Global platform control (all tenants)
    // 2. tenant_admin: Full control over a single organization (tenant)
    // 3. other levels: Restricted access within a tenant
    level: {
      type: String,
      enum: [
        "system_admin",
        "superadmin", // Platform-wide global admin
        "tenant_admin", // Organisation admin
        "regularUser", // Standard org employee (no geographic scope)
        "state",
        "division",
        "district",
        "assembly",
        "block",
        "panchayat",
        "village",
        "booth",
      ],
      default: "regularUser",
    },
    state: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
    division: { type: mongoose.Schema.Types.ObjectId, ref: "Division" },
    district: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
    assembly: { type: mongoose.Schema.Types.ObjectId, ref: "Assembly" },
    block: { type: mongoose.Schema.Types.ObjectId, ref: "Block" },
    panchayat: { type: mongoose.Schema.Types.ObjectId, ref: "Panchayat" },
    village: { type: String, trim: true },
    booth: { type: mongoose.Schema.Types.ObjectId, ref: "Booth" },
    permissions: {
      type: Map, // Use Map instead of Object for better Mongoose handling
      of: Boolean, // Assuming permissions are key-value booleans or similar
      default: {},
    },
    requirePasswordChange: {
      type: Boolean,
      default: false,
    },

    // ── Forgot Password ───────────────────────────────────────────────────────
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // ── Email Verification ────────────────────────────────────────────────────
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // ── Two-Factor Authentication (MFA) ───────────────────────────────────────
    mfaEnabled: { type: Boolean, default: false },
    mfaSecret: { type: String, select: false },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password to hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
