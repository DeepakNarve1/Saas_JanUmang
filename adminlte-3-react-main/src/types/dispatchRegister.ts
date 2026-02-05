export interface IDispatchRegisterFormValues {
  date: string;
  year: string;
  month: string;
  portalNo: string;
  samitiNo: string;
  dispatchNo: string;
  department: string;
  particulars: string;
  reference: string;
  district: string;
  block: string;
  panchayat: any[]; // Stores array of {label, value} objects
  village: any[]; // Stores array of {label, value} objects
  uploadLetter: any;
}

export interface IDispatchRegister {
  _id: string;
  date: string;
  year: string;
  month: string;
  portalNo: string;
  samitiNo: string;
  dispatchNo: string;
  department?: {
    _id: string;
    name: string;
  };
  particulars: string;
  reference: string;
  district?: {
    _id: string;
    name: string;
  };
  block?: {
    _id: string;
    name: string;
  };
  panchayat?: {
    _id: string;
    name: string;
  }[];
  village?: {
    _id: string;
    name: string;
  }[];
  uploadLetter?: string;
  addedBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IDispatchRegisterResponse {
  data: IDispatchRegister[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
