export interface IWorkTypeFormValues {
  name: string;
}

export interface IWorkType {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWorkTypeResponse {
  data: IWorkType[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
