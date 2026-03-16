import { ITenantShort } from "./user";

export interface IMemberFormValues {
  name: string;
  voterId: string;
  mobile: string;
  fatherName: string;
  dob: string;
  dom: string;
  district: string;
  block: string;
  boothName: string;
  boothNumber: string;
  grampanchayat: string;
  village: string;
  samiti: string;
  toll: string;
  jaati: string;
  age: number;
  education: string;
  address: string;
  gender: string;
  vehicle: string;
  group: string;
  govtEmployee: string;
  party: string;
  postYear: number;
  code: string;
  nariSammanYojna: string;
  farmerLoanWaiver: string;
  reference: string;
  remark: string;
  facebook: string;
  instagram: string;
  twitter: string;
  startLat: number;
  startLong: number;
  startDate: string;
  endLat: number;
  endLong: number;
  endDate: string;
  image: string;
}

export interface IMember {
  _id: string;
  addedBy: string;
  name: string;
  voterId: string;
  mobile: string;
  fatherName: string;
  dob: string;
  dom: string;
  district: string;
  block: string;
  boothName: string;
  boothNumber: string;
  grampanchayat: string;
  village: string;
  samiti: string;
  toll: string;
  jaati: string;
  age: number;
  education: string;
  address: string;
  gender: string;
  vehicle: string;
  group: string;
  govtEmployee: string;
  party: string;
  postYear: number;
  code: string;
  nariSammanYojna: string;
  farmerLoanWaiver: string;
  reference: string;
  remark: string;
  facebook: string;
  instagram: string;
  twitter: string;
  startLat: number;
  startLong: number;
  startDate: string;
  endLat: number;
  endLong: number;
  endDate: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  tenantId?: string | ITenantShort;
}

export interface IMemberResponse {
  data: IMember[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
