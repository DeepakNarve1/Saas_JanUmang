import { ITenantShort } from "./user";

export interface IVisitorFormValues {
  district: string;
  vidhansabha: string;
  block: string;
  date: string;
  time: string;
  name: string;
  category: string;
  post: string;
  place: string;
  mobileNumber: string;
  incomingVisitor: string;
  message: string;
  visitorType: string;
  attendBy: string;
  remarks: string;
  bhaiyakanirdesh: string;
  addedBy: string;
  tenantId?: string;
}

export interface IVisitor {
  _id: string;
  district: string;
  vidhansabha: string;
  block: string;
  date: string;
  time: string;
  name: string;
  category: string;
  post: string;
  place: string;
  mobileNumber: string;
  incomingVisitor: string;
  message: string;
  visitorType: string;
  attendBy: string;
  remarks: string;
  bhaiyakanirdesh: string;
  addedBy: string;
  tenantId?: string | ITenantShort;
}

export interface IVisitorResponse {
  data: IVisitor[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
