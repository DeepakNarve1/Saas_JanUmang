import { PERMISSIONS } from "@app/config/permissions";
export interface IMenuItem {
  name: string;
  icon?: string;
  path?: string;
  children?: Array<IMenuItem>;
  allowedRoles?: string[];
  allowedPermissions?: string[];
  resource?: string;
}

export const MENU: IMenuItem[] = [
  {
    name: "Dashboard",
    icon: "fas fa-tachometer-alt nav-icon",
    path: "/dashboard",
    allowedPermissions: [PERMISSIONS.VIEW_DASHBOARD],
  },
  {
    name: "Users",
    icon: "fas fa-wrench nav-icon",
    path: "/users",
    allowedRoles: ["tenant_admin", "superadmin", "system_admin"],
    resource: "users",
  },
  {
    name: "Organizations",
    icon: "fas fa-building nav-icon",
    path: "/tenants",
    allowedRoles: ["superadmin", "system_admin"],
    resource: "tenants",
  },
  {
    name: "Subscription",
    icon: "fas fa-credit-card nav-icon",
    path: "/subscription",
    allowedRoles: ["tenant_admin"],
  },
  {
    name: "Roles",
    icon: "fas fa-user-shield nav-icon",
    path: "/roles",
    allowedRoles: ["tenant_admin", "superadmin", "system_admin"],
    allowedPermissions: [PERMISSIONS.MANAGE_ROLES, PERMISSIONS.VIEW_ROLES],
  },
  {
    name: "User Count",
    icon: "fas fa-user nav-icon",
    path: "/user-count",
    allowedRoles: ["tenant_admin", "superadmin", "system_admin"],
    allowedPermissions: [PERMISSIONS.VIEW_USER_COUNT],
    resource: "user_count",
  },
  {
    name: "Member List",
    icon: "fas fa-users nav-icon",
    path: "/member-list",
    allowedPermissions: [PERMISSIONS.VIEW_MEMBERS],
    resource: "members",
  },

  {
    name: "MP Public Problem",
    icon: "fas fa-exclamation-circle nav-icon",
    path: "/mp-public-problem",
    resource: "mp_public_problems",
  },
  {
    name: "Assembly Issue",
    icon: "fas fa-university nav-icon",
    path: "/assembly-issue",
    resource: "assembly_issues",
    allowedPermissions: [PERMISSIONS.VIEW_ASSEMBLY_ISSUES],
  },
  {
    name: "Vidhasabha Samiti",
    icon: "fas fa-building nav-icon",
    allowedPermissions: [PERMISSIONS.VIEW_VIDHAN_SABHA_SAMITI],
    resource: "vidhan_sabha_samiti",
    children: [
      {
        name: "Ganesh-Samiti",
        icon: "far fa-circle nav-icon",
        path: "/vidhasabha-samiti/ganesh-samiti",
        resource: "ganesh_samiti",
      },
      {
        name: "Tenkar-Samiti",
        icon: "fas fa-water nav-icon",
        path: "/vidhasabha-samiti/tenkar-samiti",
        resource: "tenkar_samiti",
      },
      {
        name: "DP-Samiti",
        icon: "fas fa-bolt nav-icon",
        path: "/vidhasabha-samiti/dp-samiti",
        resource: "dp_samiti",
      },
      {
        name: "Mandir-Samiti",
        icon: "fas fa-monument nav-icon",
        path: "/vidhasabha-samiti/mandir-samiti",
        resource: "mandir_samiti",
      },
      {
        name: "Bhagoria-Samiti",
        icon: "fas fa-music nav-icon",
        path: "/vidhasabha-samiti/bhagoria-samiti",
        resource: "bhagoria_samiti",
      },
      {
        name: "Nirman-Samiti",
        icon: "fas fa-hard-hat nav-icon",
        path: "/vidhasabha-samiti/nirman-samiti",
        resource: "nirman_samiti",
      },
      {
        name: "Booth-Samiti",
        icon: "fas fa-person-booth nav-icon",
        path: "/vidhasabha-samiti/booth-samiti",
        resource: "booth_samiti",
      },
      {
        name: "Block-Samiti",
        icon: "fas fa-cubes nav-icon",
        path: "/vidhasabha-samiti/block-samiti",
        resource: "block_samiti",
      },
    ],
  },
  {
    name: "Project Summary",
    icon: "fas fa-user-friends nav-icon",
    path: "/project-summary",
    resource: "projects",
  },
  {
    name: "Visitors",
    icon: "fas fa-id-badge nav-icon",
    path: "/visitors",
    resource: "visitors",
  },
  {
    name: "Events",
    icon: "fas fa-calendar-alt nav-icon",
    resource: "events",
    allowedPermissions: [PERMISSIONS.VIEW_EVENTS],
    children: [
      {
        name: "Event List",
        icon: "far fa-circle nav-icon",
        path: "/events",
        resource: "events",
      },
      {
        name: "Events Calendar",
        icon: "far fa-circle nav-icon",
        path: "/events/calendar",
        allowedPermissions: [PERMISSIONS.VIEW_EVENTS_CALENDAR],
        resource: "events",
      },
    ],
  },
  {
    name: "Voter",
    icon: "fas fa-vote-yea nav-icon",
    path: "/voter",
    resource: "voters",
  },
  {
    name: "Samiti",
    icon: "fas fa-handshake nav-icon",
    path: "/samiti",
    allowedPermissions: [PERMISSIONS.VIEW_SAMITI],
    resource: "samiti",
  },
  {
    name: "District",
    icon: "fas fa-map-marker-alt nav-icon",
    path: "/districts",
    allowedPermissions: [
      PERMISSIONS.VIEW_DISTRICTS,
      PERMISSIONS.MANAGE_DISTRICTS,
    ],
    resource: "districts",
  },
  {
    name: "Vidhan Sabha",
    icon: "fas fa-gavel nav-icon",
    path: "/vidhansabha",
    allowedPermissions: [PERMISSIONS.VIEW_ASSEMBLIES],
    resource: "assemblies",
  },
  {
    name: "Block",
    icon: "fas fa-cubes nav-icon",
    path: "/blocks",
    allowedPermissions: [PERMISSIONS.VIEW_BLOCKS, PERMISSIONS.MANAGE_BLOCKS],
    resource: "blocks",
  },
  {
    name: "Booth",
    icon: "fas fa-person-booth nav-icon",
    path: "/booths",
    allowedPermissions: [PERMISSIONS.VIEW_BOOTHS, PERMISSIONS.MANAGE_BOOTHS],
    resource: "booths",
  },
  {
    name: "Panchayat",
    icon: "fas fa-users nav-icon",
    path: "/panchayat",
    allowedPermissions: [
      PERMISSIONS.VIEW_PANCHAYATS,
      PERMISSIONS.MANAGE_PANCHAYATS,
    ],
    resource: "panchayats",
  },
  {
    name: "Village",
    icon: "fas fa-home nav-icon",
    path: "/villages",
    allowedPermissions: [
      PERMISSIONS.VIEW_VILLAGES,
      PERMISSIONS.MANAGE_VILLAGES,
    ],
    resource: "villages",
  },
  {
    name: "Party",
    icon: "fas fa-flag nav-icon",
    path: "/party",
    allowedPermissions: [PERMISSIONS.VIEW_PARTIES],
    resource: "parties",
  },
  {
    name: "Department",
    icon: "fas fa-building nav-icon",
    path: "/department",
    allowedPermissions: [PERMISSIONS.VIEW_DEPARTMENTS],
    resource: "departments",
  },
  {
    name: "Worktype",
    icon: "fas fa-briefcase nav-icon",
    path: "/worktype",
    allowedPermissions: [PERMISSIONS.VIEW_WORK_TYPES],
    resource: "work_types",
  },
  {
    name: "Sub Type of Work",
    icon: "fas fa-tasks nav-icon",
    path: "/sub-type-of-work",
    allowedPermissions: [PERMISSIONS.VIEW_SUB_WORK_TYPES],
    resource: "sub_work_types",
  },
  {
    name: "State",
    icon: "fas fa-map nav-icon",
    path: "/states",
    allowedPermissions: [PERMISSIONS.VIEW_STATES, PERMISSIONS.MANAGE_STATES],
    resource: "states",
  },
  {
    name: "Division",
    icon: "fas fa-layer-group nav-icon",
    path: "/divisions",
    allowedPermissions: [
      PERMISSIONS.VIEW_DIVISIONS,
      PERMISSIONS.MANAGE_DIVISIONS,
    ],
    resource: "divisions",
  },
  {
    name: "Parliament",
    icon: "fas fa-landmark nav-icon",
    path: "/parliaments",
    allowedPermissions: [
      PERMISSIONS.VIEW_PARLIAMENTS,
      PERMISSIONS.MANAGE_PARLIAMENTS,
    ],
    resource: "parliaments",
  },
  {
    name: "Assembly",
    icon: "fas fa-columns nav-icon",
    path: "/assemblies",
    allowedPermissions: [
      PERMISSIONS.VIEW_ASSEMBLIES,
      PERMISSIONS.MANAGE_ASSEMBLIES,
    ],
    resource: "assemblies",
  },

  {
    name: "Phone Directory",
    icon: "fas fa-address-book nav-icon",
    path: "/phone-directory",
    allowedPermissions: [PERMISSIONS.VIEW_PHONE_DIRECTORY],
    resource: "phone_directory",
  },

  {
    name: "In Docs",
    icon: "fas fa-file-alt nav-icon",
    path: "/in-docs",
    allowedPermissions: [PERMISSIONS.VIEW_IN_DOCS],
    resource: "in_docs",
  },
  {
    name: "Inward Register",
    icon: "fas fa-file-invoice nav-icon",
    path: "/inward-register",
    allowedPermissions: [PERMISSIONS.VIEW_INWARD_REGISTER],
    resource: "inward_register",
  },
  {
    name: "Dispatch Register",
    icon: "fas fa-paper-plane nav-icon",
    path: "/dispatch-register",
    allowedPermissions: [PERMISSIONS.VIEW_DISPATCH_REGISTER],
    resource: "dispatch_register",
  },
  {
    name: "Call Management",
    icon: "fas fa-phone nav-icon",
    path: "/call-management",
    allowedPermissions: [PERMISSIONS.VIEW_CALL_MANAGEMENT],
    resource: "call_management",
  },
  {
    name: "Activity Management",
    icon: "fas fa-history nav-icon",
    // allowedRoles removed
    allowedPermissions: [
      PERMISSIONS.VIEW_ACTIVITY_LOGS,
      PERMISSIONS.VIEW_USER_ACTIVITY_REPORT,
    ],
    resource: "activity_management",
    children: [
      {
        name: "Activity Logs",
        icon: "far fa-circle nav-icon",
        path: "/activity-management/activity-logs",
        resource: "activity_logs",
      },
      {
        name: "User Activity Report",
        icon: "fas fa-chart-line nav-icon",
        path: "/activity-management/user-activity-report",
        resource: "user_activity_report",
      },
    ],
  },
];
