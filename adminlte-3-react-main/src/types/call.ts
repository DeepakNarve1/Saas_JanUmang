export interface ICallFormValues {
  date: string; // Date & Time
  category: string;
  name: string;
  mobile: string;
  subject: string;
  assignDate: string; // Assign Date & Time
  address: string;
  description: string;
  remark: string;
}

export interface ICall {
  _id: string;
  date: string;
  category: string;
  name: string;
  mobile: string;
  subject: string;
  assignDate: string;
  address: string;
  description: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
  addedBy?: {
    _id: string;
    name: string;
  };
}

export interface ICallResponse {
  data: ICall[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
