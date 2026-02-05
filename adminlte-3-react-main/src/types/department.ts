export interface IDepartmentFormValues {
  name: string;
}

export interface IDepartment {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDepartmentResponse {
  success: boolean;
  data: IDepartment[];
  count: number;
  filteredCount: number;
  total?: number;
  page?: number;
  limit?: number;
}
