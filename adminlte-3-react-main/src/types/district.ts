export interface IDistrictFormValues {
  name: string;
  division: string;
}

export interface IDistrict {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IDistrictResponse {
  data: IDistrict[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
