export interface IStateFormValues {
  name: string;
}

export interface IState {
  _id: string;
  name: string;
  divisions?: { _id: string; name: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IStateResponse {
  data: IState[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
