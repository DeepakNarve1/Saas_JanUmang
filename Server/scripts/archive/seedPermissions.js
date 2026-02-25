const mongoose = require("mongoose");
const Permission = require("./src/models/permissionModel");
const Role = require("./src/models/roleModel");
require("dotenv").config();

const permissions = [
  // Dashboard
  {
    name: "view_dashboard",
    displayName: "View Dashboard",
    description: "Can view dashboard",
    category: "dashboard",
  },

  // Users
  {
    name: "view_users",
    displayName: "View Users",
    description: "Can view users list",
    category: "users",
  },
  {
    name: "create_users",
    displayName: "Create Users",
    description: "Can create users",
    category: "users",
  },
  {
    name: "edit_users",
    displayName: "Edit Users",
    description: "Can edit users",
    category: "users",
  },
  {
    name: "delete_users",
    displayName: "Delete Users",
    description: "Can delete users",
    category: "users",
  },

  // Roles
  {
    name: "view_roles",
    displayName: "View Roles",
    description: "Can view roles list",
    category: "roles",
  },
  {
    name: "create_roles",
    displayName: "Create Roles",
    description: "Can create roles",
    category: "roles",
  },
  {
    name: "edit_roles",
    displayName: "Edit Roles",
    description: "Can edit roles",
    category: "roles",
  },
  {
    name: "delete_roles",
    displayName: "Delete Roles",
    description: "Can delete roles",
    category: "roles",
  },

  // User Count
  {
    name: "view_user_count",
    displayName: "View User Count",
    description: "Can view user count",
    category: "user_count",
  },

  // Projects
  {
    name: "view_projects",
    displayName: "View Projects",
    description: "Can view project summary",
    category: "projects",
  },
  {
    name: "create_projects",
    displayName: "Create Projects",
    description: "Can create projects",
    category: "projects",
  },
  {
    name: "edit_projects",
    displayName: "Edit Projects",
    description: "Can edit projects",
    category: "projects",
  },
  {
    name: "delete_projects",
    displayName: "Delete Projects",
    description: "Can delete projects",
    category: "projects",
  },

  // MP Public Problems
  {
    name: "view_mp_public_problems",
    displayName: "View MP Public Problems",
    description: "Can view MP public problems",
    category: "mp_public_problems",
  },
  {
    name: "create_mp_public_problems",
    displayName: "Create MP Public Problems",
    description: "Can create MP public problems",
    category: "mp_public_problems",
  },
  {
    name: "edit_mp_public_problems",
    displayName: "Edit MP Public Problems",
    description: "Can edit MP public problems",
    category: "mp_public_problems",
  },
  {
    name: "delete_mp_public_problems",
    displayName: "Delete MP Public Problems",
    description: "Can delete MP public problems",
    category: "mp_public_problems",
  },

  {
    name: "view_assembly_issues",
    displayName: "View Assembly Issues",
    description: "Can view assembly issues",
    category: "assembly_issues",
  },
  {
    name: "create_assembly_issues",
    displayName: "Create Assembly Issues",
    description: "Can create assembly issues",
    category: "assembly_issues",
  },
  {
    name: "edit_assembly_issues",
    displayName: "Edit Assembly Issues",
    description: "Can edit assembly issues",
    category: "assembly_issues",
  },
  {
    name: "delete_assembly_issues",
    displayName: "Delete Assembly Issues",
    description: "Can delete assembly issues",
    category: "assembly_issue",
  },

  // Events
  {
    name: "view_events",
    displayName: "View Events",
    description: "Can view events",
    category: "events",
  },
  {
    name: "create_events",
    displayName: "Create Events",
    description: "Can create events",
    category: "events",
  },
  {
    name: "edit_events",
    displayName: "Edit Events",
    description: "Can edit events",
    category: "events",
  },
  {
    name: "delete_events",
    displayName: "Delete Events",
    description: "Can delete events",
    category: "events",
  },

  // Voters
  {
    name: "view_voters",
    displayName: "View Voters",
    description: "Can view voters",
    category: "voters",
  },
  {
    name: "create_voters",
    displayName: "Create Voters",
    description: "Can create voter",
    category: "voters",
  },
  {
    name: "edit_voters",
    displayName: "Edit Voters",
    description: "Can edit voter",
    category: "voters",
  },
  {
    name: "delete_voters",
    displayName: "Delete Voters",
    description: "Can delete voter",
    category: "voters",
  },

  // Ganesh Samiti
  {
    name: "view_ganesh_samiti",
    displayName: "View Ganesh Samiti",
    description: "Can view Ganesh Samiti records",
    category: "ganesh_samiti",
  },
  {
    name: "create_ganesh_samiti",
    displayName: "Create Ganesh Samiti",
    description: "Can create Ganesh Samiti records",
    category: "ganesh_samiti",
  },
  {
    name: "edit_ganesh_samiti",
    displayName: "Edit Ganesh Samiti",
    description: "Can edit Ganesh Samiti records",
    category: "ganesh_samiti",
  },
  {
    name: "delete_ganesh_samiti",
    displayName: "Delete Ganesh Samiti",
    description: "Can delete Ganesh Samiti records",
    category: "ganesh_samiti",
  },

  // Tenkar Samiti
  {
    name: "view_tenkar_samiti",
    displayName: "View Tenkar Samiti",
    description: "Can view Tenkar Samiti records",
    category: "tenkar_samiti",
  },
  {
    name: "create_tenkar_samiti",
    displayName: "Create Tenkar Samiti",
    description: "Can create Tenkar Samiti records",
    category: "tenkar_samiti",
  },
  {
    name: "edit_tenkar_samiti",
    displayName: "Edit Tenkar Samiti",
    description: "Can edit Tenkar Samiti records",
    category: "tenkar_samiti",
  },
  {
    name: "delete_tenkar_samiti",
    displayName: "Delete Tenkar Samiti",
    description: "Can delete Tenkar Samiti records",
    category: "tenkar_samiti",
  },

  // Samiti (Generic)
  {
    name: "view_samiti",
    displayName: "View Samiti",
    description: "Can view samiti list",
    category: "samiti",
  },
  {
    name: "create_samiti",
    displayName: "Create Samiti",
    description: "Can create samiti",
    category: "samiti",
  },
  {
    name: "edit_samiti",
    displayName: "Edit Samiti",
    description: "Can edit samiti",
    category: "samiti",
  },
  {
    name: "delete_samiti",
    displayName: "Delete Samiti",
    description: "Can delete samiti",
    category: "samiti",
  },
  {
    name: "export_samiti",
    displayName: "Export Samiti",
    description: "Can export samiti list",
    category: "samiti",
  },

  // DP Samiti
  {
    name: "view_dp_samiti",
    displayName: "View DP Samiti",
    description: "Can view DP Samiti records",
    category: "dp_samiti",
  },
  {
    name: "create_dp_samiti",
    displayName: "Create DP Samiti",
    description: "Can create DP Samiti records",
    category: "dp_samiti",
  },
  {
    name: "edit_dp_samiti",
    displayName: "Edit DP Samiti",
    description: "Can edit DP Samiti records",
    category: "dp_samiti",
  },
  {
    name: "delete_dp_samiti",
    displayName: "Delete DP Samiti",
    description: "Can delete DP Samiti records",
    category: "dp_samiti",
  },

  // Mandir Samiti
  {
    name: "view_mandir_samiti",
    displayName: "View Mandir Samiti",
    description: "Can view Mandir Samiti records",
    category: "mandir_samiti",
  },
  {
    name: "create_mandir_samiti",
    displayName: "Create Mandir Samiti",
    description: "Can create Mandir Samiti records",
    category: "mandir_samiti",
  },
  {
    name: "edit_mandir_samiti",
    displayName: "Edit Mandir Samiti",
    description: "Can edit Mandir Samiti records",
    category: "mandir_samiti",
  },
  {
    name: "delete_mandir_samiti",
    displayName: "Delete Mandir Samiti",
    description: "Can delete Mandir Samiti records",
    category: "mandir_samiti",
  },

  // Bhagoria Samiti
  {
    name: "view_bhagoria_samiti",
    displayName: "View Bhagoria Samiti",
    description: "Can view Bhagoria Samiti records",
    category: "bhagoria_samiti",
  },
  {
    name: "create_bhagoria_samiti",
    displayName: "Create Bhagoria Samiti",
    description: "Can create Bhagoria Samiti records",
    category: "bhagoria_samiti",
  },
  {
    name: "edit_bhagoria_samiti",
    displayName: "Edit Bhagoria Samiti",
    description: "Can edit Bhagoria Samiti records",
    category: "bhagoria_samiti",
  },
  {
    name: "delete_bhagoria_samiti",
    displayName: "Delete Bhagoria Samiti",
    description: "Can delete Bhagoria Samiti records",
    category: "bhagoria_samiti",
  },

  // Nirman Samiti
  {
    name: "view_nirman_samiti",
    displayName: "View Nirman Samiti",
    description: "Can view Nirman Samiti records",
    category: "nirman_samiti",
  },
  {
    name: "create_nirman_samiti",
    displayName: "Create Nirman Samiti",
    description: "Can create Nirman Samiti records",
    category: "nirman_samiti",
  },
  {
    name: "edit_nirman_samiti",
    displayName: "Edit Nirman Samiti",
    description: "Can edit Nirman Samiti records",
    category: "nirman_samiti",
  },
  {
    name: "delete_nirman_samiti",
    displayName: "Delete Nirman Samiti",
    description: "Can delete Nirman Samiti records",
    category: "nirman_samiti",
  },

  // Booth Samiti
  {
    name: "view_booth_samiti",
    displayName: "View Booth Samiti",
    description: "Can view Booth Samiti records",
    category: "booth_samiti",
  },
  {
    name: "create_booth_samiti",
    displayName: "Create Booth Samiti",
    description: "Can create Booth Samiti records",
    category: "booth_samiti",
  },
  {
    name: "edit_booth_samiti",
    displayName: "Edit Booth Samiti",
    description: "Can edit Booth Samiti records",
    category: "booth_samiti",
  },
  {
    name: "delete_booth_samiti",
    displayName: "Delete Booth Samiti",
    description: "Can delete Booth Samiti records",
    category: "booth_samiti",
  },

  // Block Samiti
  {
    name: "view_block_samiti",
    displayName: "View Block Samiti",
    description: "Can view Block Samiti records",
    category: "block_samiti",
  },
  {
    name: "create_block_samiti",
    displayName: "Create Block Samiti",
    description: "Can create Block Samiti records",
    category: "block_samiti",
  },
  {
    name: "edit_block_samiti",
    displayName: "Edit Block Samiti",
    description: "Can edit Block Samiti records",
    category: "block_samiti",
  },
  {
    name: "delete_block_samiti",
    displayName: "Delete Block Samiti",
    description: "Can delete Block Samiti records",
    category: "block_samiti",
  },

  // Vidhan Sabha Samiti
  {
    name: "view_vidhansabha_samiti",
    displayName: "View Vidhan Sabha Samiti",
    description: "Can view Vidhan Sabha Samiti module",
    category: "vidhan_sabha_samiti",
  },
  {
    name: "create_vidhansabha_samiti",
    displayName: "Create Vidhan Sabha Samiti",
    description: "Can create Vidhan Sabha Samiti module",
    category: "vidhan_sabha_samiti",
  },
  {
    name: "edit_vidhansabha_samiti",
    displayName: "Edit Vidhan Sabha Samiti",
    description: "Can edit Vidhan Sabha Samiti module",
    category: "vidhan_sabha_samiti",
  },
  {
    name: "delete_vidhansabha_samiti",
    displayName: "Delete Vidhan Sabha Samiti",
    description: "Can delete Vidhan Sabha Samiti module",
    category: "vidhansabha_samiti",
  },
  // District
  {
    name: "view_districts",
    displayName: "View Districts",
    description: "Can view districts list",
    category: "districts",
  },
  {
    name: "create_districts",
    displayName: "Create Districts",
    description: "Can create districts",
    category: "districts",
  },
  {
    name: "edit_districts",
    displayName: "Edit Districts",
    description: "Can edit districts",
    category: "districts",
  },
  {
    name: "delete_districts",
    displayName: "Delete Districts",
    description: "Can delete districts",
    category: "districts",
  },

  // Division
  {
    name: "view_divisions",
    displayName: "View Divisions",
    description: "Can view divisions list",
    category: "divisions",
  },
  {
    name: "create_divisions",
    displayName: "Create Divisions",
    description: "Can create divisions",
    category: "divisions",
  },
  {
    name: "edit_divisions",
    displayName: "Edit Divisions",
    description: "Can edit divisions",
    category: "divisions",
  },
  {
    name: "delete_divisions",
    displayName: "Delete Divisions",
    description: "Can delete divisions",
    category: "divisions",
  },

  // State
  {
    name: "view_states",
    displayName: "View States",
    description: "Can view states list",
    category: "states",
  },
  {
    name: "create_states",
    displayName: "Create States",
    description: "Can create states",
    category: "states",
  },
  {
    name: "edit_states",
    displayName: "Edit States",
    description: "Can edit states",
    category: "states",
  },
  {
    name: "delete_states",
    displayName: "Delete States",
    description: "Can delete states",
    category: "states",
  },

  // Parliament
  {
    name: "view_parliaments",
    displayName: "View Parliaments",
    description: "Can view parliaments list",
    category: "parliaments",
  },
  {
    name: "create_parliaments",
    displayName: "Create Parliaments",
    description: "Can create parliaments",
    category: "parliaments",
  },
  {
    name: "edit_parliaments",
    displayName: "Edit Parliaments",
    description: "Can edit parliaments",
    category: "parliaments",
  },
  {
    name: "delete_parliaments",
    displayName: "Delete Parliaments",
    description: "Can delete parliaments",
    category: "parliaments",
  },

  // Assembly
  {
    name: "view_assemblies",
    displayName: "View Assemblies",
    description: "Can view assemblies list",
    category: "assemblies",
  },
  {
    name: "create_assemblies",
    displayName: "Create Assemblies",
    description: "Can create assemblies",
    category: "assemblies",
  },
  {
    name: "edit_assemblies",
    displayName: "Edit Assemblies",
    description: "Can edit assemblies",
    category: "assemblies",
  },
  {
    name: "delete_assemblies",
    displayName: "Delete Assemblies",
    description: "Can delete assemblies",
    category: "assemblies",
  },

  // Block
  {
    name: "view_blocks",
    displayName: "View Blocks",
    description: "Can view blocks list",
    category: "blocks",
  },
  {
    name: "create_blocks",
    displayName: "Create Blocks",
    description: "Can create blocks",
    category: "blocks",
  },
  {
    name: "edit_blocks",
    displayName: "Edit Blocks",
    description: "Can edit blocks",
    category: "blocks",
  },
  {
    name: "delete_blocks",
    displayName: "Delete Blocks",
    description: "Can delete blocks",
    category: "blocks",
  },

  // Booth
  {
    name: "view_booths",
    displayName: "View Booths",
    description: "Can view booths list",
    category: "booths",
  },
  {
    name: "create_booths",
    displayName: "Create Booths",
    description: "Can create booths",
    category: "booths",
  },
  {
    name: "edit_booths",
    displayName: "Edit Booths",
    description: "Can edit booths",
    category: "booths",
  },
  {
    name: "delete_booths",
    displayName: "Delete Booths",
    description: "Can delete booths",
    category: "booths",
  },

  // Panchayats
  {
    name: "view_panchayats",
    displayName: "View Panchayats",
    description: "Can view panchayat list",
    category: "panchayats",
  },
  {
    name: "create_panchayats",
    displayName: "Create Panchayats",
    description: "Can create panchayat",
    category: "panchayats",
  },
  {
    name: "edit_panchayats",
    displayName: "Edit Panchayats",
    description: "Can edit panchayat",
    category: "panchayats",
  },
  {
    name: "delete_panchayats",
    displayName: "Delete Panchayats",
    description: "Can delete panchayat",
    category: "panchayats",
  },
  // Village
  {
    name: "view_villages",
    displayName: "View Villages",
    description: "Can view villages list",
    category: "villages",
  },
  {
    name: "create_villages",
    displayName: "Create Villages",
    description: "Can create villages",
    category: "villages",
  },
  {
    name: "edit_villages",
    displayName: "Edit Villages",
    description: "Can edit villages",
    category: "villages",
  },
  {
    name: "delete_villages",
    displayName: "Delete Villages",
    description: "Can delete villages",
    category: "villages",
  },

  // Member
  {
    name: "view_members",
    displayName: "View Members",
    description: "Can view members list",
    category: "members",
  },
  {
    name: "create_members",
    displayName: "Create Members",
    description: "Can create members",
    category: "members",
  },
  {
    name: "edit_members",
    displayName: "Edit Members",
    description: "Can edit members",
    category: "members",
  },
  {
    name: "delete_members",
    displayName: "Delete Members",
    description: "Can delete members",
    category: "members",
  },

  // Visitors
  {
    name: "view_visitors",
    displayName: "View Visitors",
    description: "Can view visitors list",
    category: "visitors",
  },
  {
    name: "create_visitors",
    displayName: "Create Visitors",
    description: "Can create visitors",
    category: "visitors",
  },
  {
    name: "edit_visitors",
    displayName: "Edit Visitors",
    description: "Can edit visitors",
    category: "visitors",
  },
  {
    name: "delete_visitors",
    displayName: "Delete Visitors",
    description: "Can delete visitors",
    category: "visitors",
  },

  // Parties
  {
    name: "view_parties",
    displayName: "View Parties",
    description: "Can view party list",
    category: "parties",
  },
  {
    name: "create_parties",
    displayName: "Create Parties",
    description: "Can create party",
    category: "parties",
  },
  {
    name: "edit_parties",
    displayName: "Edit Parties",
    description: "Can edit party",
    category: "parties",
  },
  {
    name: "delete_parties",
    displayName: "Delete Parties",
    description: "Can delete party",
    category: "parties",
  },
  // Assemblies (Vidhan Sabha)
  {
    name: "view_assemblies",
    displayName: "View Assemblies",
    description: "Can view Vidhan Sabha list",
    category: "assemblies",
  },
  {
    name: "create_assemblies",
    displayName: "Create Assemblies",
    description: "Can create Vidhan Sabha",
    category: "assemblies",
  },
  {
    name: "edit_assemblies",
    displayName: "Edit Assemblies",
    description: "Can edit Vidhan Sabha",
    category: "assemblies",
  },
  {
    name: "delete_assemblies",
    displayName: "Delete Assemblies",
    description: "Can delete Vidhan Sabha",
    category: "assemblies",
  },
  // Sub Work Types
  {
    name: "view_sub_work_types",
    displayName: "View Sub Work Types",
    description: "Can view Sub Work Types list",
    category: "sub_work_types",
  },
  {
    name: "create_sub_work_types",
    displayName: "Create Sub Work Types",
    description: "Can create Sub Work Types",
    category: "sub_work_types",
  },
  {
    name: "edit_sub_work_types",
    displayName: "Edit Sub Work Types",
    description: "Can edit Sub Work Types",
    category: "sub_work_types",
  },
  {
    name: "delete_sub_work_types",
    displayName: "Delete Sub Work Types",
    description: "Can delete Sub Work Types",
    category: "sub_work_types",
  },
  // Departments
  {
    name: "view_departments",
    displayName: "View Departments",
    description: "Can view Department list",
    category: "departments",
  },
  {
    name: "create_departments",
    displayName: "Create Departments",
    description: "Can create Department",
    category: "departments",
  },
  {
    name: "edit_departments",
    displayName: "Edit Departments",
    description: "Can edit Department",
    category: "departments",
  },
  {
    name: "delete_departments",
    displayName: "Delete Departments",
    description: "Can delete Department",
    category: "departments",
  },
  // Phone Directory
  {
    name: "view_phone_directory",
    displayName: "View Phone Directory",
    description: "Can view Phone Directory list",
    category: "phone_directory",
  },
  {
    name: "create_phone_directory",
    displayName: "Create Phone Directory",
    description: "Can create Phone Directory entry",
    category: "phone_directory",
  },
  {
    name: "edit_phone_directory",
    displayName: "Edit Phone Directory",
    description: "Can edit Phone Directory entry",
    category: "phone_directory",
  },
  {
    name: "delete_phone_directory",
    displayName: "Delete Phone Directory",
    description: "Can delete Phone Directory entry",
    category: "phone_directory",
  },
  // Work Types
  {
    name: "view_work_types",
    displayName: "View Work Types",
    description: "Can view Work Types list",
    category: "work_types",
  },
  {
    name: "create_work_types",
    displayName: "Create Work Types",
    description: "Can create Work Types",
    category: "work_types",
  },
  {
    name: "edit_work_types",
    displayName: "Edit Work Types",
    description: "Can edit Work Types",
    category: "work_types",
  },
  {
    name: "delete_work_types",
    displayName: "Delete Work Types",
    description: "Can delete Work Types",
    category: "work_types",
  },
  // In Docs
  {
    name: "view_in_docs",
    displayName: "View In Docs",
    description: "Can view In Docs list",
    category: "in_docs",
  },
  {
    name: "create_in_docs",
    displayName: "Create In Docs",
    description: "Can create In Docs entry",
    category: "in_docs",
  },
  {
    name: "edit_in_docs",
    displayName: "Edit In Docs",
    description: "Can edit In Docs entry",
    category: "in_docs",
  },
  {
    name: "delete_in_docs",
    displayName: "Delete In Docs",
    description: "Can delete In Docs entry",
    category: "in_docs",
  },
  // Inward Register
  {
    name: "view_inward_register",
    displayName: "View Inward Register",
    description: "Can view Inward Register list",
    category: "inward_register",
  },
  {
    name: "create_inward_register",
    displayName: "Create Inward Register",
    description: "Can create Inward Register entry",
    category: "inward_register",
  },
  {
    name: "edit_inward_register",
    displayName: "Edit Inward Register",
    description: "Can edit Inward Register entry",
    category: "inward_register",
  },
  {
    name: "delete_inward_register",
    displayName: "Delete Inward Register",
    description: "Can delete Inward Register entry",
    category: "inward_register",
  },
  // Dispatch Register
  {
    name: "view_dispatch_register",
    displayName: "View Dispatch Register",
    description: "Can view Dispatch Register list",
    category: "dispatch_register",
  },
  {
    name: "create_dispatch_register",
    displayName: "Create Dispatch Register",
    description: "Can create Dispatch Register entry",
    category: "dispatch_register",
  },
  {
    name: "edit_dispatch_register",
    displayName: "Edit Dispatch Register",
    description: "Can edit Dispatch Register entry",
    category: "dispatch_register",
  },
  {
    name: "delete_dispatch_register",
    displayName: "Delete Dispatch Register",
    description: "Can delete Dispatch Register entry",
    category: "dispatch_register",
  },
  // Call Management
  {
    name: "view_call_management",
    displayName: "View Call Management",
    description: "Can view Call Management list",
    category: "call_management",
  },
  {
    name: "create_call_management",
    displayName: "Create Call Management",
    description: "Can create Call Management entry",
    category: "call_management",
  },
  {
    name: "edit_call_management",
    displayName: "Edit Call Management",
    description: "Can edit Call Management entry",
    category: "call_management",
  },
  {
    name: "delete_call_management",
    displayName: "Delete Call Management",
    description: "Can delete Call Management entry",
    category: "call_management",
  },
  // Activity Management
  {
    name: "view_activity_logs",
    displayName: "View Activity Logs",
    description: "Can view user activity logs",
    category: "activity_management",
  },
  {
    name: "view_user_activity_report",
    displayName: "View User Activity Report",
    description: "Can view user activity reports",
    category: "activity_management",
  },
  {
    name: "create_activity_logs", // Optional: Usually system generated, but maybe for manual entry?
    displayName: "Create Activity Logs",
    description: "Can create activity logs",
    category: "activity_management",
  },
  {
    name: "delete_activity_logs", // Optional
    displayName: "Delete Activity Logs",
    description: "Can delete activity logs",
    category: "activity_management",
  },
  // Sidebar Permissions
  {
    name: "view_sidebar_permissions",
    displayName: "View Sidebar Permissions",
    description: "Can view and manage sidebar menu permissions",
    category: "sidebar_permissions",
  },
  {
    name: "edit_sidebar_permissions",
    displayName: "Edit Sidebar Permissions",
    description: "Can edit sidebar menu permissions",
    category: "sidebar_permissions",
  },
];

async function seedPermissions() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing permissions
    await Permission.deleteMany({});
    console.log("🗑️  Cleared existing permissions");

    // Create permissions
    console.log("Creating permissions object...");
    try {
      const validCategories = [
        "view",
        "create",
        "edit",
        "delete",
        "export",
        "manage",
        "other",
      ];
      const preparedPermissions = permissions.map((p) => {
        const actionPrefix = p.name.split("_")[0];
        return {
          ...p,
          module: p.category, // Map dummy 'category' to 'module'
          category: validCategories.includes(actionPrefix)
            ? actionPrefix
            : "other",
        };
      });

      const createdPermissions = await Permission.insertMany(
        preparedPermissions,
        {
          ordered: false,
        },
      );
      console.log(`✅ Created ${createdPermissions.length} permissions`);

      // Update superadmin role with all permissions
      const superadminRole = await Role.findOne({ name: "superadmin" });
      if (superadminRole) {
        superadminRole.permissions = createdPermissions.map((p) => p._id);
        superadminRole.sidebarAccess = ["*"];
        await superadminRole.save();
        console.log("✅ Updated superadmin role with all permissions");
      } else {
        // Create superadmin role if it doesn't exist
        await Role.create({
          name: "superadmin",
          displayName: "Super Administrator",
          description: "Full system access with all permissions",
          permissions: createdPermissions.map((p) => p._id),
          sidebarAccess: ["*"],
          isSystem: true,
        });
        console.log("✅ Created superadmin role");
      }
    } catch (insertError) {
      console.error("Error during insertMany or Role update:", insertError);
      if (insertError.writeErrors) {
        console.error("Write Errors:", insertError.writeErrors);
      }
    }

    console.log("\n📋 Permissions created:");
    permissions.forEach((p) => {
      console.log(`  - ${p.name} (${p.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedPermissions();
