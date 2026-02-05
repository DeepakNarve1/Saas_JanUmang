export interface IVidhanSabhaFormValues {
  name: string;
  year?: number;
}

export interface IVidhanSabha {
  _id: string;
  name: string;
  year?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  addedBy?: string;
}

export interface IVidhanSabhaResponse {
  data: IVidhanSabha[];
  count: number;
  total: number;
  page: number;
  limit: number;
}
