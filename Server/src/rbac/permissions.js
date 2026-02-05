export const Roles = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
};

export const Permissions = {
  DASHBOARD: "dashboard",
  USERS: "users",
  REPORTS: "reports",
  SETTINGS: "settings",
};

export const RolePermissions = {
  [Roles.ADMIN]: [
    Permissions.DASHBOARD,
    Permissions.USERS,
    Permissions.REPORTS,
    Permissions.SETTINGS,
  ],
  [Roles.MANAGER]: [Permissions.DASHBOARD, Permissions.REPORTS],
  [Roles.EMPLOYEE]: [Permissions.DASHBOARD],
};
