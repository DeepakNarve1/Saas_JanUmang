export interface IUser {
  uid: string;
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
}

export interface ITenantShort {
  _id: string;
  name: string;
  enabledModules?: string[];
  plan?: string;
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
