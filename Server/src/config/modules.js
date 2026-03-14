const PERMISSIONS = require("../../../shared/permissions.json");
/**
 * Module Registry - Central definition of all system modules
 * This defines which modules exist and their associated permissions
 */

const MODULES = {
  // ============================================
  // SIDEBAR ALIGNED MODULES (Order matches sidebar)
  // ============================================
  DASHBOARD: {
    id: "dashboard",
    name: "Dashboard",
    description: "System overview and analytics",
    category: "core",
    alwaysEnabled: true,
    permissions: [PERMISSIONS.VIEW_DASHBOARD],
  },

  USERS: {
    id: "users",
    name: "User",
    description: "Manage users and access",
    category: "core",
    alwaysEnabled: true,
    permissions: [
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.CREATE_USERS,
      PERMISSIONS.EDIT_USERS,
      PERMISSIONS.DELETE_USERS,
      PERMISSIONS.RESET_PASSWORD,
    ],
  },

  ROLES: {
    id: "roles",
    name: "Role",
    description: "Manage roles and permissions",
    category: "core",
    alwaysEnabled: true,
    permissions: [
      PERMISSIONS.VIEW_ROLES,
      PERMISSIONS.CREATE_ROLES,
      PERMISSIONS.EDIT_ROLES,
      PERMISSIONS.DELETE_ROLES,
      PERMISSIONS.MANAGE_ROLES,
    ],
  },

  USER_COUNT: {
    id: "user_count",
    name: "User Count",
    description: "View user distribution by role and location",
    category: "core",
    alwaysEnabled: true,
    permissions: [PERMISSIONS.VIEW_USER_COUNT],
  },

  MEMBERS: {
    id: "members",
    name: "Member List",
    description: "Member/Constituent management",
    category: "people",
    permissions: [
      PERMISSIONS.VIEW_MEMBERS,
      PERMISSIONS.CREATE_MEMBERS,
      PERMISSIONS.EDIT_MEMBERS,
      PERMISSIONS.DELETE_MEMBERS,
      PERMISSIONS.EXPORT_MEMBERS,
    ],
  },

  MP_PUBLIC_PROBLEMS: {
    id: "mp_public_problems",
    name: "MP Public Problem",
    description: "Manage public problems and complaints",
    category: "operations",
    permissions: [
      PERMISSIONS.VIEW_MP_PUBLIC_PROBLEMS,
      PERMISSIONS.CREATE_MP_PUBLIC_PROBLEMS,
      PERMISSIONS.EDIT_MP_PUBLIC_PROBLEMS,
      PERMISSIONS.DELETE_MP_PUBLIC_PROBLEMS,
      PERMISSIONS.EXPORT_MP_PUBLIC_PROBLEMS,
    ],
  },

  ASSEMBLY_ISSUES: {
    id: "assembly_issues",
    name: "Assembly Issue",
    description: "Track and manage assembly issues",
    category: "operations",
    permissions: [
      PERMISSIONS.VIEW_ASSEMBLY_ISSUES,
      PERMISSIONS.CREATE_ASSEMBLY_ISSUES,
      PERMISSIONS.EDIT_ASSEMBLY_ISSUES,
      PERMISSIONS.DELETE_ASSEMBLY_ISSUES,
      PERMISSIONS.EXPORT_ASSEMBLY_ISSUES,
    ],
  },

  VIDHAN_SABHA_SAMITI: {
    id: "vidhan_sabha_samiti",
    name: "Vidhansabha Samiti",
    description: "Vidhasabha Samiti management",
    category: "legislative",
    permissions: [
      PERMISSIONS.VIEW_VIDHAN_SABHA_SAMITI,
      PERMISSIONS.CREATE_VIDHAN_SABHA_SAMITI,
      PERMISSIONS.EDIT_VIDHAN_SABHA_SAMITI,
      PERMISSIONS.DELETE_VIDHAN_SABHA_SAMITI,
    ],
  },

  GANESH_SAMITI: {
    id: "ganesh_samiti",
    name: "Ganesh-Samiti",
    description: "Ganesh Samiti management",
    category: "legislative",
    permissions: [
      PERMISSIONS.VIEW_GANESH_SAMITI,
      PERMISSIONS.CREATE_GANESH_SAMITI,
      PERMISSIONS.EDIT_GANESH_SAMITI,
      PERMISSIONS.DELETE_GANESH_SAMITI,
    ],
  },

  TENKAR_SAMITI: {
    id: "tenkar_samiti",
    name: "Tenkar-Samiti",
    description: "Tenkar Samiti management",
    category: "legislative",
    permissions: [
      PERMISSIONS.VIEW_TENKAR_SAMITI,
      PERMISSIONS.CREATE_TENKAR_SAMITI,
      PERMISSIONS.EDIT_TENKAR_SAMITI,
      PERMISSIONS.DELETE_TENKAR_SAMITI,
    ],
  },

  DP_SAMITI: {
    id: "dp_samiti",
    name: "DP-Samiti",
    description: "DP Samiti management",
    category: "legislative",
    permissions: [
      PERMISSIONS.VIEW_DP_SAMITI,
      PERMISSIONS.CREATE_DP_SAMITI,
      PERMISSIONS.EDIT_DP_SAMITI,
      PERMISSIONS.DELETE_DP_SAMITI,
    ],
  },

  MANDIR_SAMITI: {
    id: "mandir_samiti",
    name: "Mandir-Samiti",
    description: "Mandir Samiti management",
    category: "legislative",
    permissions: [
      PERMISSIONS.VIEW_MANDIR_SAMITI,
      PERMISSIONS.CREATE_MANDIR_SAMITI,
      PERMISSIONS.EDIT_MANDIR_SAMITI,
      PERMISSIONS.DELETE_MANDIR_SAMITI,
    ],
  },

  BHAGORIA_SAMITI: {
    id: "bhagoria_samiti",
    name: "Bhagoria-Samiti",
    description: "Bhagoria Samiti management",
    category: "legislative",
    permissions: [
      PERMISSIONS.VIEW_BHAGORIA_SAMITI,
      PERMISSIONS.CREATE_BHAGORIA_SAMITI,
      PERMISSIONS.EDIT_BHAGORIA_SAMITI,
      PERMISSIONS.DELETE_BHAGORIA_SAMITI,
    ],
  },

  NIRMAN_SAMITI: {
    id: "nirman_samiti",
    name: "Nirman-Samiti",
    description: "Nirman Samiti management",
    category: "legislative",
    permissions: [
      PERMISSIONS.VIEW_NIRMAN_SAMITI,
      PERMISSIONS.CREATE_NIRMAN_SAMITI,
      PERMISSIONS.EDIT_NIRMAN_SAMITI,
      PERMISSIONS.DELETE_NIRMAN_SAMITI,
    ],
  },

  BOOTH_SAMITI: {
    id: "booth_samiti",
    name: "Booth-Samiti",
    description: "Booth Samiti management",
    category: "legislative",
    permissions: [
      PERMISSIONS.VIEW_BOOTH_SAMITI,
      PERMISSIONS.CREATE_BOOTH_SAMITI,
      PERMISSIONS.EDIT_BOOTH_SAMITI,
      PERMISSIONS.DELETE_BOOTH_SAMITI,
    ],
  },

  BLOCK_SAMITI: {
    id: "block_samiti",
    name: "Block-Samiti",
    description: "Block Samiti management",
    category: "legislative",
    permissions: [
      PERMISSIONS.VIEW_BLOCK_SAMITI,
      PERMISSIONS.CREATE_BLOCK_SAMITI,
      PERMISSIONS.EDIT_BLOCK_SAMITI,
      PERMISSIONS.DELETE_BLOCK_SAMITI,
    ],
  },

  PROJECTS: {
    id: "projects",
    name: "Project Summary",
    description: "Project management and tracking",
    category: "operations",
    permissions: [
      PERMISSIONS.VIEW_PROJECTS,
      PERMISSIONS.CREATE_PROJECTS,
      PERMISSIONS.EDIT_PROJECTS,
      PERMISSIONS.DELETE_PROJECTS,
      PERMISSIONS.EXPORT_PROJECTS,
    ],
  },

  VISITORS: {
    id: "visitors",
    name: "Visitors",
    description: "Visitor tracking and management",
    category: "activities",
    permissions: [
      PERMISSIONS.VIEW_VISITORS,
      PERMISSIONS.CREATE_VISITORS,
      PERMISSIONS.EDIT_VISITORS,
      PERMISSIONS.DELETE_VISITORS,
    ],
  },

  EVENTS: {
    id: "events",
    name: "Events",
    description: "Event management and tracking",
    category: "activities",
    permissions: [
      PERMISSIONS.VIEW_EVENTS,
      PERMISSIONS.CREATE_EVENTS,
      PERMISSIONS.EDIT_EVENTS,
      PERMISSIONS.DELETE_EVENTS,
      PERMISSIONS.VIEW_EVENTS_CALENDAR,
    ],
  },

  VOTERS: {
    id: "voters",
    name: "Voter",
    description: "Voter list management",
    category: "people",
    permissions: [
      PERMISSIONS.VIEW_VOTERS,
      PERMISSIONS.CREATE_VOTERS,
      PERMISSIONS.EDIT_VOTERS,
      PERMISSIONS.DELETE_VOTERS,
      PERMISSIONS.EXPORT_VOTERS,
    ],
  },

  SAMITI: {
    id: "samiti",
    name: "Samiti",
    description: "Samiti management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_SAMITI,
      PERMISSIONS.CREATE_SAMITI,
      PERMISSIONS.EDIT_SAMITI,
      PERMISSIONS.DELETE_SAMITI,
      PERMISSIONS.MANAGE_SAMITI,
      PERMISSIONS.EXPORT_SAMITI,
    ],
  },

  DISTRICTS: {
    id: "districts",
    name: "District",
    description: "District management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_DISTRICTS,
      PERMISSIONS.CREATE_DISTRICTS,
      PERMISSIONS.EDIT_DISTRICTS,
      PERMISSIONS.DELETE_DISTRICTS,
      PERMISSIONS.MANAGE_DISTRICTS,
    ],
  },

  VIDHAN_SABHA: {
    id: "assemblies",
    name: "Vidhan Sabha",
    description: "Vidhan Sabha management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_ASSEMBLIES,
      PERMISSIONS.CREATE_ASSEMBLIES,
      PERMISSIONS.EDIT_ASSEMBLIES,
      PERMISSIONS.DELETE_ASSEMBLIES,
      PERMISSIONS.MANAGE_ASSEMBLIES,
    ],
  },

  BLOCKS: {
    id: "blocks",
    name: "Block",
    description: "Block/Tehsil management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_BLOCKS,
      PERMISSIONS.CREATE_BLOCKS,
      PERMISSIONS.EDIT_BLOCKS,
      PERMISSIONS.DELETE_BLOCKS,
      PERMISSIONS.MANAGE_BLOCKS,
    ],
  },

  BOOTHS: {
    id: "booths",
    name: "Booth",
    description: "Polling booth management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_BOOTHS,
      PERMISSIONS.CREATE_BOOTHS,
      PERMISSIONS.EDIT_BOOTHS,
      PERMISSIONS.DELETE_BOOTHS,
      PERMISSIONS.MANAGE_BOOTHS,
    ],
  },

  PANCHAYATS: {
    id: "panchayats",
    name: "Panchayat",
    description: "Panchayat management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_PANCHAYATS,
      PERMISSIONS.CREATE_PANCHAYATS,
      PERMISSIONS.EDIT_PANCHAYATS,
      PERMISSIONS.DELETE_PANCHAYATS,
      PERMISSIONS.MANAGE_PANCHAYATS,
    ],
  },

  VILLAGES: {
    id: "villages",
    name: "Village",
    description: "Village management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_VILLAGES,
      PERMISSIONS.CREATE_VILLAGES,
      PERMISSIONS.EDIT_VILLAGES,
      PERMISSIONS.DELETE_VILLAGES,
      PERMISSIONS.MANAGE_VILLAGES,
    ],
  },

  PARTIES: {
    id: "parties",
    name: "Party",
    description: "Political party management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_PARTIES,
      PERMISSIONS.CREATE_PARTIES,
      PERMISSIONS.EDIT_PARTIES,
      PERMISSIONS.DELETE_PARTIES,
      PERMISSIONS.MANAGE_PARTIES,
    ],
  },

  DEPARTMENTS: {
    id: "departments",
    name: "Department",
    description: "Department management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_DEPARTMENTS,
      PERMISSIONS.CREATE_DEPARTMENTS,
      PERMISSIONS.EDIT_DEPARTMENTS,
      PERMISSIONS.DELETE_DEPARTMENTS,
      PERMISSIONS.MANAGE_DEPARTMENTS,
    ],
  },

  WORK_TYPES: {
    id: "work_types",
    name: "Worktype",
    description: "Work type management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_WORK_TYPES,
      PERMISSIONS.CREATE_WORK_TYPES,
      PERMISSIONS.EDIT_WORK_TYPES,
      PERMISSIONS.DELETE_WORK_TYPES,
      PERMISSIONS.MANAGE_WORK_TYPES,
    ],
  },

  SUB_WORK_TYPES: {
    id: "sub_work_types",
    name: "Sub Type of Work",
    description: "Sub work type management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_SUB_WORK_TYPES,
      PERMISSIONS.CREATE_SUB_WORK_TYPES,
      PERMISSIONS.EDIT_SUB_WORK_TYPES,
      PERMISSIONS.DELETE_SUB_WORK_TYPES,
      PERMISSIONS.MANAGE_SUB_WORK_TYPES,
    ],
  },

  STATES: {
    id: "states",
    name: "State",
    description: "State management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_STATES,
      PERMISSIONS.CREATE_STATES,
      PERMISSIONS.EDIT_STATES,
      PERMISSIONS.DELETE_STATES,
      PERMISSIONS.MANAGE_STATES,
    ],
  },

  DIVISIONS: {
    id: "divisions",
    name: "Division",
    description: "Division management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_DIVISIONS,
      PERMISSIONS.CREATE_DIVISIONS,
      PERMISSIONS.EDIT_DIVISIONS,
      PERMISSIONS.DELETE_DIVISIONS,
      PERMISSIONS.MANAGE_DIVISIONS,
    ],
  },

  PARLIAMENTS: {
    id: "parliaments",
    name: "Parliament",
    description: "Parliament management",
    category: "master_data",
    permissions: [
      PERMISSIONS.VIEW_PARLIAMENTS,
      PERMISSIONS.CREATE_PARLIAMENTS,
      PERMISSIONS.EDIT_PARLIAMENTS,
      PERMISSIONS.DELETE_PARLIAMENTS,
      PERMISSIONS.MANAGE_PARLIAMENTS,
    ],
  },

  PHONE_DIRECTORY: {
    id: "phone_directory",
    name: "Phone Directory",
    description: "System phone directory",
    category: "people",
    permissions: [
      PERMISSIONS.VIEW_PHONE_DIRECTORY,
      PERMISSIONS.CREATE_PHONE_DIRECTORY,
      PERMISSIONS.EDIT_PHONE_DIRECTORY,
      PERMISSIONS.DELETE_PHONE_DIRECTORY,
    ],
  },

  INWARD_REGISTER: {
    id: "inward_register",
    name: "Inward Register",
    description: "Track inward correspondence",
    category: "documents",
    permissions: [
      PERMISSIONS.VIEW_INWARD_REGISTER,
      PERMISSIONS.CREATE_INWARD_REGISTER,
      PERMISSIONS.EDIT_INWARD_REGISTER,
      PERMISSIONS.DELETE_INWARD_REGISTER,
    ],
  },

  DISPATCH_REGISTER: {
    id: "dispatch_register",
    name: "Dispatch Register",
    description: "Track dispatch correspondence",
    category: "documents",
    permissions: [
      PERMISSIONS.VIEW_DISPATCH_REGISTER,
      PERMISSIONS.CREATE_DISPATCH_REGISTER,
      PERMISSIONS.EDIT_DISPATCH_REGISTER,
      PERMISSIONS.DELETE_DISPATCH_REGISTER,
    ],
  },

  IN_DOCS: {
    id: "in_docs",
    name: "In Docs (जावक दस्तावेज़)",
    description: "Track outgoing documents and correspondence",
    category: "documents",
    permissions: [
      PERMISSIONS.VIEW_IN_DOCS,
      PERMISSIONS.CREATE_IN_DOCS,
      PERMISSIONS.EDIT_IN_DOCS,
      PERMISSIONS.DELETE_IN_DOCS,
    ],
  },

  CALL_MANAGEMENT: {
    id: "call_management",
    name: "Call Management",
    description: "Track and manage calls",
    category: "activities",
    permissions: [
      PERMISSIONS.VIEW_CALL_MANAGEMENT,
      PERMISSIONS.CREATE_CALL_MANAGEMENT,
      PERMISSIONS.EDIT_CALL_MANAGEMENT,
      PERMISSIONS.DELETE_CALL_MANAGEMENT,
    ],
  },

  ACTIVITY_MANAGEMENT: {
    id: "activity_management",
    name: "Activity Management",
    description: "Track system activity and user reports",
    category: "core",
    alwaysEnabled: true,
    permissions: [
      PERMISSIONS.VIEW_ACTIVITY_LOGS,
      PERMISSIONS.VIEW_USER_ACTIVITY_REPORT,
    ],
  },
};

/**
 * Subscription Plans
 */
const PLANS = {
  BASIC: {
    id: "basic",
    name: "Basic Plan",
    description: "Essential features for small teams",
    price: 999, // per month in INR
    maxUsers: 10,
    maxStorage: 5120, // 5 GB in MB
    enabledModules: [
      "dashboard",
      "users",
      "roles",
      "user_count",
      "activity_management",
      "mp_public_problems",
      "departments",
      "blocks",
      "villages",
      "panchayats",
      "booths",
      "states",
      "divisions",
      "districts",
      "parliaments",
      "samiti",

      "parties",
      "work_types",
      "sub_work_types",
      "voters",
      "visitors",
    ],
  },

  PROFESSIONAL: {
    id: "professional",
    name: "Professional Plan",
    description: "Advanced features for growing organizations",
    price: 2499,
    maxUsers: 50,
    maxStorage: 20480, // 20 GB
    enabledModules: [
      "dashboard",
      "users",
      "roles",
      "user_count",
      "activity_management",
      "mp_public_problems",
      "projects",
      "assembly_issues",
      "departments",
      "blocks",
      "villages",
      "panchayats",
      "booths",
      "members",
      "events",
      "visitors",
      "states",
      "divisions",
      "districts",
      "parliaments",
      "assemblies",
      "samiti",

      "parties",
      "work_types",
      "sub_work_types",
      "voters",
      "phone_directory",
      "call_management",
      "inward_register",
      "dispatch_register",
      "in_docs",
      "ganesh_samiti",
      "tenkar_samiti",
      "dp_samiti",
      "mandir_samiti",
      "bhagoria_samiti",
      "nirman_samiti",
      "booth_samiti",
      "block_samiti",
      "vidhan_sabha_samiti",
    ],
  },

  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "Complete access with unlimited resources",
    price: 4999,
    maxUsers: -1, // Unlimited
    maxStorage: -1, // Unlimited
    enabledModules: Object.keys(MODULES).map((key) => MODULES[key].id), // All modules
  },

  CUSTOM: {
    id: "custom",
    name: "Custom Plan",
    description: "Tailored solution for specific needs",
    price: null, // Custom pricing
    maxUsers: null, // Configured per tenant
    maxStorage: null, // Configured per tenant
    enabledModules: [], // Manually configured
  },
};

/**
 * Helper Functions
 */

// Get all module IDs
const getAllModuleIds = () => {
  return [...new Set(Object.values(MODULES).map((m) => m.id))];
};

// Get core module IDs (always enabled)
const getCoreModuleIds = () => {
  return Object.values(MODULES)
    .filter((m) => m.alwaysEnabled)
    .map((m) => m.id);
};

// Get all modules
const getAllModules = () => {
  return Object.values(MODULES);
};

// Get module by ID
const getModuleById = (moduleId) => {
  return Object.values(MODULES).find((m) => m.id === moduleId);
};

// Get modules by category
const getModulesByCategory = (category) => {
  return Object.values(MODULES).filter((m) => m.category === category);
};

// Get all permissions for a module
const getModulePermissions = (moduleId) => {
  const module = getModuleById(moduleId);
  return module ? module.permissions : [];
};

// Get all permissions for multiple modules
const getPermissionsForModules = (moduleIds) => {
  const permissions = [];
  moduleIds.forEach((moduleId) => {
    const modulePerms = getModulePermissions(moduleId);
    permissions.push(...modulePerms);
  });
  return [...new Set(permissions)]; // Remove duplicates
};

// Validate if modules are valid
const validateModules = (moduleIds) => {
  const allModuleIds = getAllModuleIds();
  const invalidModules = moduleIds.filter((id) => !allModuleIds.includes(id));
  return {
    valid: invalidModules.length === 0,
    invalidModules,
  };
};

// Get plan configuration
const getPlanConfig = (planId) => {
  const planKey = planId.toUpperCase();
  return PLANS[planKey] || PLANS.BASIC;
};

module.exports = {
  MODULES,
  PLANS,
  getAllModules,
  getAllModuleIds,
  getCoreModuleIds,
  getModuleById,
  getModulesByCategory,
  getModulePermissions,
  getPermissionsForModules,
  validateModules,
  getPlanConfig,
};
