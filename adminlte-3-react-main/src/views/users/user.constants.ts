/**
 * User Module Constants
 *
 * Centralized constants for the user management module
 */

// ============================================================================
// BLOCK OPTIONS
// ============================================================================

export const BLOCK_OPTIONS = [
  { value: "tanda", label: "Tanda" },
  { value: "gandhwani", label: "Gandhwani" },
  { value: "bagh", label: "Bagh" },
  { value: "tirla", label: "Tirla" },
  { value: "bhopal", label: "Bhopal" },
  { value: "other", label: "Other" },
] as const;

// ============================================================================
// USER TYPE OPTIONS
// ============================================================================

export const USER_TYPE_OPTIONS = [
  { value: "regularUser", label: "Regular User" },
  { value: "systemAdministrator", label: "System Administrator" },
] as const;

export const ADMIN_LEVEL_OPTIONS = [
  { value: "regularUser", label: "Regular Employee" },
  { value: "tenant_admin", label: "Organization Admin" },
  { value: "state", label: "State Level" },
  { value: "division", label: "Division Level" },
  { value: "district", label: "District Level" },
  { value: "assembly", label: "Assembly Level" },
  { value: "block", label: "Block Level" },
  { value: "panchayat", label: "Panchayat Level" },
  { value: "village", label: "Village Level" },
  { value: "booth", label: "Booth Level" },
] as const;

// ============================================================================
// VALIDATION CONSTANTS (Re-exported for convenience)
// ============================================================================

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
} as const;

export const NAME_REQUIREMENTS = {
  minLength: 2,
  maxLength: 100,
  allowedCharacters: "letters, spaces, hyphens, and apostrophes",
} as const;

export const MOBILE_REQUIREMENTS = {
  format: "Indian mobile number (10 digits, starting with 6-9)",
  regex: /^[6-9]\d{9}$/,
} as const;

// ============================================================================
// FORM FIELD LABELS
// ============================================================================

export const FIELD_LABELS = {
  name: "Full Name",
  email: "Email Address",
  password: "Password",
  confirmPassword: "Confirm Password",
  mobile: "Mobile Number",
  role: "Role",
  userType: "User Type",
  block: "Block",
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

export type BlockValue = (typeof BLOCK_OPTIONS)[number]["value"];
export type UserTypeValue = (typeof USER_TYPE_OPTIONS)[number]["value"];
