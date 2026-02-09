import * as Yup from "yup";
import { IUserFormValues } from "@app/types/user";
export type { IUserFormValues };

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const MOBILE_REGEX = /^[6-9]\d{9}$/; // Indian mobile number format

// Password strength regex patterns
const PASSWORD_PATTERNS = {
  lowercase: /[a-z]/,
  uppercase: /[A-Z]/,
  number: /[0-9]/,
  specialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

// ============================================================================
// VALIDATION ERROR MESSAGES
// ============================================================================

const ERROR_MESSAGES = {
  name: {
    required: "Full name is required",
    min: `Name must be at least ${NAME_MIN_LENGTH} characters`,
    max: `Name cannot exceed ${NAME_MAX_LENGTH} characters`,
    invalid: "Name can only contain letters, spaces, hyphens, and apostrophes",
  },
  email: {
    required: "Email address is required",
    invalid: "Please enter a valid email address",
  },
  password: {
    required: "Password is required",
    min: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
    max: `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`,
    lowercase: "Password must contain at least one lowercase letter",
    uppercase: "Password must contain at least one uppercase letter",
    number: "Password must contain at least one number",
    specialChar:
      "Password must contain at least one special character (!@#$%^&*...)",
  },
  confirmPassword: {
    required: "Please confirm your password",
    match: "Passwords do not match",
  },
  mobile: {
    invalid: "Please enter a valid 10-digit Indian mobile number",
  },
  role: {
    required: "Please select a role",
  },
};

// ============================================================================
// CUSTOM VALIDATION METHODS
// ============================================================================

/**
 * Validates password strength based on industry standards
 */
const validatePasswordStrength = (password: string | undefined): boolean => {
  if (!password) return true; // Let required() handle empty passwords

  return (
    PASSWORD_PATTERNS.lowercase.test(password) &&
    PASSWORD_PATTERNS.uppercase.test(password) &&
    PASSWORD_PATTERNS.number.test(password) &&
    PASSWORD_PATTERNS.specialChar.test(password)
  );
};

/**
 * Validates name format (letters, spaces, hyphens, apostrophes only)
 */
const validateNameFormat = (name: string | undefined): boolean => {
  if (!name) return true;
  return /^[a-zA-Z\s'-]+$/.test(name);
};

// ============================================================================
// SCHEMA FACTORY
// ============================================================================

/**
 * Creates a validation schema based on the form mode (create/edit)
 * @param isEdit - Whether the form is in edit mode
 * @returns Yup validation schema
 */
export const getUserSchema = (isEdit: boolean) =>
  Yup.object().shape({
    // Name validation
    name: Yup.string()
      .transform((value) => value?.trim()) // Sanitize: remove leading/trailing spaces
      .required(ERROR_MESSAGES.name.required)
      .min(NAME_MIN_LENGTH, ERROR_MESSAGES.name.min)
      .max(NAME_MAX_LENGTH, ERROR_MESSAGES.name.max)
      .test("name-format", ERROR_MESSAGES.name.invalid, validateNameFormat),

    // Email validation
    email: Yup.string()
      .transform((value) => value?.trim().toLowerCase()) // Sanitize: trim and lowercase
      .required(ERROR_MESSAGES.email.required)
      .email(ERROR_MESSAGES.email.invalid)
      .max(255, "Email address is too long"),

    // Password validation (conditional based on edit mode)
    password: isEdit
      ? Yup.string()
          .optional()
          .min(PASSWORD_MIN_LENGTH, ERROR_MESSAGES.password.min)
          .max(PASSWORD_MAX_LENGTH, ERROR_MESSAGES.password.max)
          .test(
            "password-strength",
            "Password must contain uppercase, lowercase, number, and special character",
            function (value) {
              // Only validate if password is provided in edit mode
              if (!value || value.length === 0) return true;
              return validatePasswordStrength(value);
            },
          )
      : Yup.string()
          .required(ERROR_MESSAGES.password.required)
          .min(PASSWORD_MIN_LENGTH, ERROR_MESSAGES.password.min)
          .max(PASSWORD_MAX_LENGTH, ERROR_MESSAGES.password.max)
          .test(
            "password-lowercase",
            ERROR_MESSAGES.password.lowercase,
            (value) => !value || PASSWORD_PATTERNS.lowercase.test(value),
          )
          .test(
            "password-uppercase",
            ERROR_MESSAGES.password.uppercase,
            (value) => !value || PASSWORD_PATTERNS.uppercase.test(value),
          )
          .test(
            "password-number",
            ERROR_MESSAGES.password.number,
            (value) => !value || PASSWORD_PATTERNS.number.test(value),
          )
          .test(
            "password-special",
            ERROR_MESSAGES.password.specialChar,
            (value) => !value || PASSWORD_PATTERNS.specialChar.test(value),
          ),

    // Confirm password validation
    confirmPassword: Yup.string().when("password", {
      is: (val: string) => val && val.length > 0,
      then: (schema) =>
        schema
          .oneOf([Yup.ref("password")], ERROR_MESSAGES.confirmPassword.match)
          .required(ERROR_MESSAGES.confirmPassword.required),
      otherwise: (schema) => schema.optional(),
    }),

    // Mobile validation (optional but validated if provided)
    mobile: Yup.string()
      .transform((value) => value?.trim()) // Sanitize
      .optional()
      .test("mobile-format", ERROR_MESSAGES.mobile.invalid, function (value) {
        if (!value || value.length === 0) return true; // Optional field
        return MOBILE_REGEX.test(value);
      }),

    // Role validation
    role: Yup.string()
      .required(ERROR_MESSAGES.role.required)
      .test("role-not-empty", ERROR_MESSAGES.role.required, (value) => {
        return value !== "" && value !== undefined;
      }),

    // User type (optional)
    userType: Yup.string().optional(),

    // Hierarchy based access control
    level: Yup.string().required("Please select an administrative level"),
    state: Yup.string().optional(),
    division: Yup.string().optional(),
    district: Yup.string().optional(),
    assembly: Yup.string().optional(),
    block: Yup.string().optional(),
    panchayat: Yup.string().optional(),
    village: Yup.string().optional(),
    booth: Yup.string().optional(),
    tenantId: Yup.string().optional(),
  });

// ============================================================================
// SCHEMA CACHE (Performance Optimization)
// ============================================================================

// Memoized schemas to avoid recreation on every render
const schemaCache = {
  create: getUserSchema(false),
  edit: getUserSchema(true),
};

/**
 * Get cached schema based on mode
 * @param isEdit - Whether the form is in edit mode
 * @returns Cached Yup validation schema
 */
export const getCachedUserSchema = (isEdit: boolean) =>
  isEdit ? schemaCache.edit : schemaCache.create;

// Export default schema for backward compatibility
export const userSchema = schemaCache.create;

// ============================================================================
// INITIAL VALUES
// ============================================================================

export const userInitialValues: IUserFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  mobile: "",
  role: "",
  userType: "",
  level: "superadmin",
  state: "",
  division: "",
  district: "",
  assembly: "",
  block: "",
  panchayat: "",
  village: "",
  booth: "",
  tenantId: "",
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Sanitizes user form values before submission
 * @param values - Form values to sanitize
 * @returns Sanitized form values
 */
export const sanitizeUserFormValues = (
  values: IUserFormValues,
): IUserFormValues => {
  return {
    ...values,
    name: values.name?.trim(),
    email: values.email?.trim().toLowerCase(),
    mobile: values.mobile?.trim(),
    // Don't trim passwords as spaces might be intentional
  };
};
