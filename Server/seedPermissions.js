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
    category: "assembly_issue",
  },
  {
    name: "create_assembly_issues",
    displayName: "Create Assembly Issues",
    description: "Can create assembly issues",
    category: "assembly_issue",
  },
  {
    name: "edit_assembly_issues",
    displayName: "Edit Assembly Issues",
    description: "Can edit assembly issues",
    category: "assembly_issue",
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

  // Voter
  {
    name: "view_voter",
    displayName: "View Voter",
    description: "Can view voters",
    category: "voter",
  },
  {
    name: "create_voter",
    displayName: "Create Voter",
    description: "Can create voter",
    category: "voter",
  },
  {
    name: "edit_voter",
    displayName: "Edit Voter",
    description: "Can edit voter",
    category: "voter",
  },
  {
    name: "delete_voter",
    displayName: "Delete Voter",
    description: "Can delete voter",
    category: "voter",
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
    category: "vidhansabha_samiti",
  },
  {
    name: "create_vidhansabha_samiti",
    displayName: "Create Vidhan Sabha Samiti",
    description: "Can create Vidhan Sabha Samiti module",
    category: "vidhansabha_samiti",
  },
  {
    name: "edit_vidhansabha_samiti",
    displayName: "Edit Vidhan Sabha Samiti",
    description: "Can edit Vidhan Sabha Samiti module",
    category: "vidhansabha_samiti",
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

  // Panchayat
  {
    name: "view_panchayat",
    displayName: "View Panchayat",
    description: "Can view panchayat list",
    category: "panchayat",
  },
  {
    name: "create_panchayat",
    displayName: "Create Panchayat",
    description: "Can create panchayat",
    category: "panchayat",
  },
  {
    name: "edit_panchayat",
    displayName: "Edit Panchayat",
    description: "Can edit panchayat",
    category: "panchayat",
  },
  {
    name: "delete_panchayat",
    displayName: "Delete Panchayat",
    description: "Can delete panchayat",
    category: "panchayat",
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

  // Party
  {
    name: "view_party",
    displayName: "View Party",
    description: "Can view party list",
    category: "party",
  },
  {
    name: "create_party",
    displayName: "Create Party",
    description: "Can create party",
    category: "party",
  },
  {
    name: "edit_party",
    displayName: "Edit Party",
    description: "Can edit party",
    category: "party",
  },
  {
    name: "delete_party",
    displayName: "Delete Party",
    description: "Can delete party",
    category: "party",
  },
  // Vidhan Sabha
  {
    name: "view_vidhan_sabha",
    displayName: "View Vidhan Sabha",
    description: "Can view Vidhan Sabha list",
    category: "vidhan_sabha",
  },
  {
    name: "create_vidhan_sabha",
    displayName: "Create Vidhan Sabha",
    description: "Can create Vidhan Sabha",
    category: "vidhan_sabha",
  },
  {
    name: "edit_vidhan_sabha",
    displayName: "Edit Vidhan Sabha",
    description: "Can edit Vidhan Sabha",
    category: "vidhan_sabha",
  },
  {
    name: "delete_vidhan_sabha",
    displayName: "Delete Vidhan Sabha",
    description: "Can delete Vidhan Sabha",
    category: "vidhan_sabha",
  },
  // Sub Type Of Work
  {
    name: "view_sub_type_of_work",
    displayName: "View Sub Type Of Work",
    description: "Can view Sub Type Of Work list",
    category: "sub_type_of_work",
  },
  {
    name: "create_sub_type_of_work",
    displayName: "Create Sub Type Of Work",
    description: "Can create Sub Type Of Work",
    category: "sub_type_of_work",
  },
  {
    name: "edit_sub_type_of_work",
    displayName: "Edit Sub Type Of Work",
    description: "Can edit Sub Type Of Work",
    category: "sub_type_of_work",
  },
  {
    name: "delete_sub_type_of_work",
    displayName: "Delete Sub Type Of Work",
    description: "Can delete Sub Type Of Work",
    category: "sub_type_of_work",
  },
  // Department
  {
    name: "view_department",
    displayName: "View Department",
    description: "Can view Department list",
    category: "department",
  },
  {
    name: "create_department",
    displayName: "Create Department",
    description: "Can create Department",
    category: "department",
  },
  {
    name: "edit_department",
    displayName: "Edit Department",
    description: "Can edit Department",
    category: "department",
  },
  {
    name: "delete_department",
    displayName: "Delete Department",
    description: "Can delete Department",
    category: "department",
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
  // Worktype
  {
    name: "view_worktype",
    displayName: "View Worktype",
    description: "Can view Worktype list",
    category: "worktype",
  },
  {
    name: "create_worktype",
    displayName: "Create Worktype",
    description: "Can create Worktype",
    category: "worktype",
  },
  {
    name: "edit_worktype",
    displayName: "Edit Worktype",
    description: "Can edit Worktype",
    category: "worktype",
  },
  {
    name: "delete_worktype",
    displayName: "Delete Worktype",
    description: "Can delete Worktype",
    category: "worktype",
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
      const createdPermissions = await Permission.insertMany(permissions, {
        ordered: false,
      });
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
