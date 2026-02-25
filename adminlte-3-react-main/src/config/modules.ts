export const MODULES = {
  // CORE MODULES
  DASHBOARD: { id: "dashboard", name: "Dashboard" },
  USERS: { id: "users", name: "User Management" },
  ROLES: { id: "roles", name: "Roles & Permissions" },

  // OPERATIONS MODULES
  MP_PUBLIC_PROBLEMS: { id: "mp_public_problems", name: "MP Public Problems" },
  PROJECTS: { id: "projects", name: "Projects" },
  ASSEMBLY_ISSUES: { id: "assembly_issues", name: "Assembly Issues" },

  // MASTER DATA MODULES - LOCATIONS
  STATES: { id: "states", name: "States" },
  DIVISIONS: { id: "divisions", name: "Divisions" },
  DISTRICTS: { id: "districts", name: "Districts" },
  PARLIAMENTS: { id: "parliaments", name: "Parliaments" },
  ASSEMBLIES: { id: "assemblies", name: "Assemblies" },
  BLOCKS: { id: "blocks", name: "Blocks" },
  VILLAGES: { id: "villages", name: "Villages" },
  PANCHAYATS: { id: "panchayats", name: "Panchayats" },
  BOOTHS: { id: "booths", name: "Booths" },
  SAMITI: { id: "samiti", name: "Samitis" },

  // MASTER DATA MODULES - OTHERS
  DEPARTMENTS: { id: "departments", name: "Departments" },
  PARTIES: { id: "parties", name: "Political Parties" },
  WORK_TYPES: { id: "work_types", name: "Work Types" },
  SUB_WORK_TYPES: { id: "sub_work_types", name: "Sub Work Types" },

  // PEOPLE MANAGEMENT MODULES
  MEMBERS: { id: "members", name: "Members" },
  VOTERS: { id: "voters", name: "Voters" },
  PHONE_DIRECTORY: { id: "phone_directory", name: "Phone Directory" },

  // ACTIVITY MODULES
  EVENTS: { id: "events", name: "Events" },
  VISITORS: { id: "visitors", name: "Visitors" },
  CALL_MANAGEMENT: { id: "call_management", name: "Call Management" },

  // DOCUMENT MANAGEMENT MODULES
  IN_DOCS: { id: "in_docs", name: "Incoming Documents" },
  INWARD_REGISTER: { id: "inward_register", name: "Inward Register" },
  DISPATCH_REGISTER: { id: "dispatch_register", name: "Dispatch Register" },

  // LEGISLATIVE MODULES
  GANESH_SAMITI: { id: "ganesh_samiti", name: "Ganesh Samiti" },
  TENKAR_SAMITI: { id: "tenkar_samiti", name: "Tenkar Samiti" },
  DP_SAMITI: { id: "dp_samiti", name: "DP Samiti" },
  MANDIR_SAMITI: { id: "mandir_samiti", name: "Mandir Samiti" },
  BHAGORIA_SAMITI: { id: "bhagoria_samiti", name: "Bhagoria Samiti" },
  NIRMAN_SAMITI: { id: "nirman_samiti", name: "Nirman Samiti" },
  BOOTH_SAMITI: { id: "booth_samiti", name: "Booth Samiti" },
  BLOCK_SAMITI: { id: "block_samiti", name: "Block Samiti" },
};

export const MODULE_IDS = {
  DASHBOARD: "dashboard",
  USERS: "users",
  ROLES: "roles",
  MP_PUBLIC_PROBLEMS: "mp_public_problems",
  PROJECTS: "projects",
  ASSEMBLY_ISSUES: "assembly_issues",
  STATES: "states",
  DIVISIONS: "divisions",
  DISTRICTS: "districts",
  PARLIAMENTS: "parliaments",
  ASSEMBLIES: "assemblies",
  BLOCKS: "blocks",
  VILLAGES: "villages",
  PANCHAYATS: "panchayats",
  BOOTHS: "booths",
  SAMITI: "samiti",
  DEPARTMENTS: "departments",
  PARTIES: "parties",
  WORK_TYPES: "work_types",
  SUB_WORK_TYPES: "sub_work_types",
  MEMBERS: "members",
  VOTERS: "voters",
  PHONE_DIRECTORY: "phone_directory",
  EVENTS: "events",
  VISITORS: "visitors",
  CALL_MANAGEMENT: "call_management",
  IN_DOCS: "in_docs",
  INWARD_REGISTER: "inward_register",
  DISPATCH_REGISTER: "dispatch_register",
  GANESH_SAMITI: "ganesh_samiti",
  TENKAR_SAMITI: "tenkar_samiti",
  DP_SAMITI: "dp_samiti",
  MANDIR_SAMITI: "mandir_samiti",
  BHAGORIA_SAMITI: "bhagoria_samiti",
  NIRMAN_SAMITI: "nirman_samiti",
  BOOTH_SAMITI: "booth_samiti",
  BLOCK_SAMITI: "block_samiti",
};

export type ModuleId = (typeof MODULE_IDS)[keyof typeof MODULE_IDS];
