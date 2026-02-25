export interface IPermission {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

export interface IRoleFormValues {
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  status: "active" | "inactive";
  tenantId?: string;
}

export interface IRole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  isSystem?: boolean;
  status?: "active" | "inactive";
  createdAt?: string;
}

export interface IRoleResponse {
  data: IRole[];
  count: number;
  total: number;
  page: number;
  limit: number;
}
