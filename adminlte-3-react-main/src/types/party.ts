export interface IPartyFormValues {
  name: string;
}

export interface IParty {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPartyResponse {
  data: IParty[];
  count: number;
  total: number;
  page: number;
  limit: number;
}
