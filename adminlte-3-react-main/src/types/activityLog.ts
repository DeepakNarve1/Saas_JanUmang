export interface IActivityLog {
  _id: string;
  user?: {
    _id: string;
    name: string;
    role?: {
      _id: string;
      name: string;
      displayName?: string;
    };
  };
  userName?: string; // Snapshot
  action: string;
  module: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: {
    tableName?: string;
    recordId?: string;
    newData?: any;
    oldData?: any;
    [key: string]: any;
  };
  snapshot?: {
    userName?: string;
    roleName?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IActivityLogResponse {
  data: IActivityLog[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}

export interface IActivityLogFilters {
  modules?: string[];
  actions?: string[];
}
