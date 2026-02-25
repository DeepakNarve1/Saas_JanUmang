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
    permissions: ["view_dashboard"],
  },

  USERS: {
    id: "users",
    name: "User",
    description: "Manage users and access",
    category: "core",
    alwaysEnabled: true,
    permissions: [
      "view_users",
      "create_users",
      "edit_users",
      "delete_users",
      "reset_password",
    ],
  },

  ROLES: {
    id: "roles",
    name: "Role",
    description: "Manage roles and permissions",
    category: "core",
    alwaysEnabled: true,
    permissions: [
      "view_roles",
      "create_roles",
      "edit_roles",
      "delete_roles",
      "manage_roles",
    ],
  },

  USER_COUNT: {
    id: "user_count",
    name: "User Count",
    description: "View user distribution by role and location",
    category: "core",
    alwaysEnabled: true,
    permissions: ["view_user_count"],
  },

  MEMBERS: {
    id: "members",
    name: "Member List",
    description: "Member/Constituent management",
    category: "people",
    permissions: [
      "view_members",
      "create_members",
      "edit_members",
      "delete_members",
      "export_members",
    ],
  },

  MP_PUBLIC_PROBLEMS: {
    id: "mp_public_problems",
    name: "MP Public Problem",
    description: "Manage public problems and complaints",
    category: "operations",
    permissions: [
      "view_mp_public_problems",
      "create_mp_public_problems",
      "edit_mp_public_problems",
      "delete_mp_public_problems",
      "export_mp_public_problems",
    ],
  },

  ASSEMBLY_ISSUES: {
    id: "assembly_issues",
    name: "Assembly Issue",
    description: "Track and manage assembly issues",
    category: "operations",
    permissions: [
      "view_assembly_issues",
      "create_assembly_issues",
      "edit_assembly_issues",
      "delete_assembly_issues",
      "export_assembly_issues",
    ],
  },

  VIDHAN_SABHA_SAMITI: {
    id: "vidhan_sabha_samiti",
    name: "Vidhasabha Samiti",
    description: "Vidhasabha Samiti management",
    category: "legislative",
    permissions: ["view_vidhan_sabha_samiti"],
  },

  GANESH_SAMITI: {
    id: "ganesh_samiti",
    name: "Ganesh-Samiti",
    description: "Ganesh Samiti management",
    category: "legislative",
    permissions: [
      "view_ganesh_samiti",
      "create_ganesh_samiti",
      "edit_ganesh_samiti",
      "delete_ganesh_samiti",
    ],
  },

  TENKAR_SAMITI: {
    id: "tenkar_samiti",
    name: "Tenkar-Samiti",
    description: "Tenkar Samiti management",
    category: "legislative",
    permissions: [
      "view_tenkar_samiti",
      "create_tenkar_samiti",
      "edit_tenkar_samiti",
      "delete_tenkar_samiti",
    ],
  },

  DP_SAMITI: {
    id: "dp_samiti",
    name: "DP-Samiti",
    description: "DP Samiti management",
    category: "legislative",
    permissions: [
      "view_dp_samiti",
      "create_dp_samiti",
      "edit_dp_samiti",
      "delete_dp_samiti",
    ],
  },

  MANDIR_SAMITI: {
    id: "mandir_samiti",
    name: "Mandir-Samiti",
    description: "Mandir Samiti management",
    category: "legislative",
    permissions: [
      "view_mandir_samiti",
      "create_mandir_samiti",
      "edit_mandir_samiti",
      "delete_mandir_samiti",
    ],
  },

  BHAGORIA_SAMITI: {
    id: "bhagoria_samiti",
    name: "Bhagoria-Samiti",
    description: "Bhagoria Samiti management",
    category: "legislative",
    permissions: [
      "view_bhagoria_samiti",
      "create_bhagoria_samiti",
      "edit_bhagoria_samiti",
      "delete_bhagoria_samiti",
    ],
  },

  NIRMAN_SAMITI: {
    id: "nirman_samiti",
    name: "Nirman-Samiti",
    description: "Nirman Samiti management",
    category: "legislative",
    permissions: [
      "view_nirman_samiti",
      "create_nirman_samiti",
      "edit_nirman_samiti",
      "delete_nirman_samiti",
    ],
  },

  BOOTH_SAMITI: {
    id: "booth_samiti",
    name: "Booth-Samiti",
    description: "Booth Samiti management",
    category: "legislative",
    permissions: [
      "view_booth_samiti",
      "create_booth_samiti",
      "edit_booth_samiti",
      "delete_booth_samiti",
    ],
  },

  BLOCK_SAMITI: {
    id: "block_samiti",
    name: "Block-Samiti",
    description: "Block Samiti management",
    category: "legislative",
    permissions: [
      "view_block_samiti",
      "create_block_samiti",
      "edit_block_samiti",
      "delete_block_samiti",
    ],
  },

  PROJECTS: {
    id: "projects",
    name: "Project Summary",
    description: "Project management and tracking",
    category: "operations",
    permissions: [
      "view_projects",
      "create_projects",
      "edit_projects",
      "delete_projects",
      "export_projects",
    ],
  },

  VISITORS: {
    id: "visitors",
    name: "Visitors",
    description: "Visitor tracking and management",
    category: "activities",
    permissions: [
      "view_visitors",
      "create_visitors",
      "edit_visitors",
      "delete_visitors",
    ],
  },

  EVENTS: {
    id: "events",
    name: "Events",
    description: "Event management and tracking",
    category: "activities",
    permissions: [
      "view_events",
      "create_events",
      "edit_events",
      "delete_events",
      "view_events_calendar",
    ],
  },

  VOTERS: {
    id: "voters",
    name: "Voter",
    description: "Voter list management",
    category: "people",
    permissions: [
      "view_voters",
      "create_voters",
      "edit_voters",
      "delete_voters",
      "export_voters",
    ],
  },

  SAMITI: {
    id: "samiti",
    name: "Samiti",
    description: "Samiti management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_samiti",
      "create_samiti",
      "edit_samiti",
      "delete_samiti",
      "manage_samiti",
    ],
  },

  DISTRICTS: {
    id: "districts",
    name: "District",
    description: "District management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_districts",
      "create_districts",
      "edit_districts",
      "delete_districts",
      "manage_districts",
    ],
  },

  VIDHAN_SABHA: {
    id: "assemblies",
    name: "Vidhan Sabha",
    description: "Vidhan Sabha management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_assemblies",
      "create_assemblies",
      "edit_assemblies",
      "delete_assemblies",
      "manage_assemblies",
    ],
  },

  BLOCKS: {
    id: "blocks",
    name: "Block",
    description: "Block/Tehsil management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_blocks",
      "create_blocks",
      "edit_blocks",
      "delete_blocks",
      "manage_blocks",
    ],
  },

  BOOTHS: {
    id: "booths",
    name: "Booth",
    description: "Polling booth management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_booths",
      "create_booths",
      "edit_booths",
      "delete_booths",
      "manage_booths",
    ],
  },

  PANCHAYATS: {
    id: "panchayats",
    name: "Panchayat",
    description: "Panchayat management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_panchayats",
      "create_panchayats",
      "edit_panchayats",
      "delete_panchayats",
      "manage_panchayats",
    ],
  },

  VILLAGES: {
    id: "villages",
    name: "Village",
    description: "Village management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_villages",
      "create_villages",
      "edit_villages",
      "delete_villages",
      "manage_villages",
    ],
  },

  PARTIES: {
    id: "parties",
    name: "Party",
    description: "Political party management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_parties",
      "create_parties",
      "edit_parties",
      "delete_parties",
      "manage_parties",
    ],
  },

  DEPARTMENTS: {
    id: "departments",
    name: "Department",
    description: "Department management",
    category: "master_data",
    permissions: [
      "view_departments",
      "create_departments",
      "edit_departments",
      "delete_departments",
      "manage_departments",
    ],
  },

  WORK_TYPES: {
    id: "work_types",
    name: "Worktype",
    description: "Work type management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_work_types",
      "create_work_types",
      "edit_work_types",
      "delete_work_types",
      "manage_work_types",
    ],
  },

  SUB_WORK_TYPES: {
    id: "sub_work_types",
    name: "Sub Type of Work",
    description: "Sub work type management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_sub_work_types",
      "create_sub_work_types",
      "edit_sub_work_types",
      "delete_sub_work_types",
      "manage_sub_work_types",
    ],
  },

  STATES: {
    id: "states",
    name: "State",
    description: "State management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_states",
      "create_states",
      "edit_states",
      "delete_states",
      "manage_states",
    ],
  },

  DIVISIONS: {
    id: "divisions",
    name: "Division",
    description: "Division management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_divisions",
      "create_divisions",
      "edit_divisions",
      "delete_divisions",
      "manage_divisions",
    ],
  },

  PARLIAMENTS: {
    id: "parliaments",
    name: "Parliament",
    description: "Parliament management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_parliaments",
      "create_parliaments",
      "edit_parliaments",
      "delete_parliaments",
      "manage_parliaments",
    ],
  },

  ASSEMBLIES_V2: {
    id: "assemblies",
    name: "Assembly",
    description: "Vidhan Sabha management",
    category: "master_data",
    alwaysEnabled: true,
    permissions: [
      "view_assemblies",
      "create_assemblies",
      "edit_assemblies",
      "delete_assemblies",
      "manage_assemblies",
    ],
  },

  PHONE_DIRECTORY: {
    id: "phone_directory",
    name: "Phone Directory",
    description: "System phone directory",
    category: "people",
    permissions: [
      "view_phone_directory",
      "create_phone_directory",
      "edit_phone_directory",
      "delete_phone_directory",
    ],
  },

  INWARD_REGISTER: {
    id: "inward_register",
    name: "Inward Register",
    description: "Track inward correspondence",
    category: "documents",
    permissions: [
      "view_inward_register",
      "create_inward_register",
      "edit_inward_register",
      "delete_inward_register",
    ],
  },

  DISPATCH_REGISTER: {
    id: "dispatch_register",
    name: "Dispatch Register",
    description: "Track dispatch correspondence",
    category: "documents",
    permissions: [
      "view_dispatch_register",
      "create_dispatch_register",
      "edit_dispatch_register",
      "delete_dispatch_register",
    ],
  },

  IN_DOCS: {
    id: "in_docs",
    name: "In Docs (जावक दस्तावेज़)",
    description: "Track outgoing documents and correspondence",
    category: "documents",
    permissions: [
      "view_in_docs",
      "create_in_docs",
      "edit_in_docs",
      "delete_in_docs",
    ],
  },

  CALL_MANAGEMENT: {
    id: "call_management",
    name: "Call Management",
    description: "Track and manage calls",
    category: "activities",
    permissions: [
      "view_call_management",
      "create_call_management",
      "edit_call_management",
      "delete_call_management",
    ],
  },

  ACTIVITY_MANAGEMENT: {
    id: "activity_management",
    name: "Activity Management",
    description: "Track system activity and user reports",
    category: "core",
    alwaysEnabled: true,
    permissions: ["view_activity_logs", "view_user_activity_report"],
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
    maxStorage: 1024, // 1 GB in MB
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
      "assemblies",
      "samiti",

      "parties",
      "work_types",
      "sub_work_types",
    ],
  },

  PROFESSIONAL: {
    id: "professional",
    name: "Professional Plan",
    description: "Advanced features for growing organizations",
    price: 2999,
    maxUsers: 50,
    maxStorage: 10240, // 10 GB
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
    ],
  },

  ENTERPRISE: {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "Complete access with unlimited resources",
    price: 9999,
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
