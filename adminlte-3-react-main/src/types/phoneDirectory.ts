export interface IPhoneDirectoryFormValues {
  name: string;
  post: string;
  department: string;
  district: string;
  block: string;
  party: string;
  number: string;
  alternateNumber: string;
  email: string;
  remark: string;
  status: string;
}

export interface IPhoneEntry {
  _id: string;
  name: string;
  post: string;
  department: { _id: string; name: string };
  district: { _id: string; name: string };
  block: { _id: string; name: string };
  party: { _id: string; name: string };
  number: string;
  alternateNumber?: string;
  email?: string;
  remark?: string;
  status: string;
  createdAt?: string;
}

export interface IPhoneDirectoryResponse {
  data: IPhoneEntry[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
