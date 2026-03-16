import { ITenantShort } from "./user";

export interface IVoterFormValues {
  name: string;
  fatherName: string;
  mobileNumber: string;
  age: string | number;
  cast: string;
  subcast: string;
  fulladdress: string;
  blockname: string;
  boothname: string;
  boothno: string;
  panchayat: string;
  village: string;
  fallaMarjra: string;
  voterId: string;
  image: string;
}

export interface IVoter {
  _id: string;
  name: string;
  fatherName: string;
  mobileNumber: string;
  age: number;
  cast: string;
  subcast: string;
  fulladdress: string;
  blockname: string | { name: string; _id: string };
  boothname: string | { name: string; _id: string };
  boothno: string;
  panchayat: string | { name: string; _id: string };
  village: string | { name: string; _id: string };
  fallaMarjra: string;
  voterId: string;
  image?: string;
  isActive: boolean;
  block?: string | { name: string; _id: string };
  booth?: string | { name: string; _id: string };
  boothNo?: string;
  createdAt?: string;
  updatedAt?: string;
  tenantId?: string | ITenantShort;
}
