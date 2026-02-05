export interface ISamitiFormValues {
  name: string;
}

export interface ISamiti {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISamitiResponse {
  data: ISamiti[];
  count: number;
  total: number;
  page: number;
  limit: number;
}
