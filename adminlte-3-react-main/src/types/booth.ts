export interface IBoothFormValues {
  name: string;
  code: string;
  state: string;
  division: string;
  district?: string;
  parliament: string;
  assembly: string;
  block: string;
  year?: string;
}

export interface IBooth {
  _id: string;
  name: string;
  code?: string;
  state?: string | { _id: string; name: string };
  division?: string | { _id: string; name: string };
  parliament?: string | { _id: string; name: string };
  block?: string | { _id: string; name: string };
  district?: string | { _id: string; name: string };
  assembly?: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface IBoothResponse {
  data: IBooth[];
  count: number;
  filteredCount?: number;
  total: number;
  page: number;
  limit: number;
}
