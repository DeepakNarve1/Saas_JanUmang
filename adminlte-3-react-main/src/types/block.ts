export interface IBlockFormValues {
  name: string;
  state: string;
  division: string;
  district?: string;
  parliament: string;
  assembly: string;
  year?: string;
}

export interface IBlock {
  _id: string;
  name: string;
  state?: string | { _id: string; name: string };
  division?: string | { _id: string; name: string };
  district?: string | { _id: string; name: string };
  parliament?: string | { _id: string; name: string };
  assembly?:
    | string
    | {
        _id: string;
        name: string;
        parliament?: {
          district?: { name: string };
        };
      };
  year?: string;
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
