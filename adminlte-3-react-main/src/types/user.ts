export interface IUser {
  uid?: string;
  _id?: string;
  name?: string;
  email?: string;
  token?: string;
  photoURL?: string;
  role?: string | IRole;
  roles?: string[];
  permissions?: string[];
  mobile?: string;
  userType?: string;
  tenantId?: string;
  level?: string;
  metadata?: any;
  tenant?: ITenantShort;
  // Geographic scope fields — assigned to users for data isolation
  state?: string;
  division?: string;
  district?: string;
  vidhansabha?: string;
  assembly?: string;
  block?: string;
  panchayat?: string;
  village?: string;
  booth?: string;
  mfaEnabled?: boolean;
}

export interface ITenantShort {
  _id: string;
  name: string;
  slug?: string;
  status?: 'active' | 'inactive' | 'suspended' | 'trialing';
  enabledModules?: string[];
  plan?: string;
  // Trial / subscription status
  subscriptionStatus?:
    | "trial"
    | "active"
    | "suspended"
    | "cancelled"
    | "expired";
  trialEndsAt?: string | null;
  daysLeftInTrial?: number | null;
  isTrialExpiringSoon?: boolean;
}

export interface IPermission {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
}

export interface IRole {
  _id: string;
  name: string;
  displayName?: string;
  permissions?: string[] | IPermission[];
  sidebarAccess?: string[];
  status?: string;
}

export interface IUserRow {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role?: string | IRole;
  level?: string;
  tenantId?: string;
  tenant?: ITenantShort;
  createdAt?: string;
}

export interface IUserFormValues {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  mobile: string;
  role: string;
  userType: string;
  level: string;
  state?: string;
  division?: string;
  district?: string;
  assembly?: string;
  block?: string;
  panchayat?: string;
  village?: string;
  booth?: string;
  tenantId?: string;
}

export interface IRoleOption {
  _id: string;
  role?: string;
  displayName?: string;
  name?: string;
}

export interface IUserResponse {
  success: boolean;
  data: IUserRow[];
}
