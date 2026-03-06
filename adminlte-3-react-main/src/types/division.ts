export interface IDivisionFormValues {
  name: string;
  state: string;
}

export interface IDivision {
  _id: string;
  name: string;
  state?: string | { _id: string; name: string };
  districts?: { _id: string; name: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IDivisionResponse {
  data: IDivision[];
  count: number;
  total: number;
  page: number;
  limit: number;
}
