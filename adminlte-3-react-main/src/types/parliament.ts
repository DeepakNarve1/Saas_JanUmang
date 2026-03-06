export interface IParliamentFormValues {
  name: string;
  state: string;
  division: string;
  district?: string;
}

export interface IParliament {
  _id: string;
  name: string;
  state?: string | { _id: string; name: string };
  division?: string | { _id: string; name: string };
  district?: string | { _id: string; name: string };
  assemblies?: { _id: string; name: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IParliamentResponse {
  data: IParliament[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
