export interface IBlockFormValues {
  name: string;
  state: string;
  division: string;
  district?: string;
  parliament: string;
  assembly: string;
}

export interface IBlock {
  _id: string;
  name: string;
  assembly?: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface IBlockResponse {
  data: IBlock[];
  count: number;
  total: number;
  page: number;
  limit: number;
}
