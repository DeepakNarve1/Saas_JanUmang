export interface IAssemblyFormValues {
  name: string;
  state: string;
  division: string;
  district?: string;
  parliament: string;
}

export interface IAssembly {
  _id: string;
  name: string;
  state?: string | { _id: string; name: string };
  division?: string | { _id: string; name: string };
  district?: string | { _id: string; name: string };
  parliament?: string | { _id: string; name: string };
  blocks?: { _id: string; name: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IAssemblyResponse {
  data: IAssembly[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
