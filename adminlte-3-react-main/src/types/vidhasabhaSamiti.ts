export interface IGenericSamitiFormValues {
  uniqueId: string;
  year: string;
  acMpNo: string;
  block: string;
  sector: string;
  microSectorNo: string;
  microSectorName: string;
  boothName: string;
  boothNo: string;
  gramPanchayat: string;
  village: string;
  faliya: string;
  totalMembers?: string;
  image?: string; // Base64
  fileName?: string;
}

export interface IBhagoriaSamitiFormValues {
  uniqueId: string;
  block: string;
  date: string;
  day: string;
  bhagoriaHat: string;
  numberOfDol: string;
  inChargeName: string;
  mobileNumber: string;
  remark: string;
}

export interface ISamitiData {
  _id: string;
  uniqueId: string;
  year: string;
  acMpNo: string;
  block: string;
  sector: string;
  microSectorNo: string;
  microSectorName: string;
  boothName: string;
  boothNo: string;
  gramPanchayat: string;
  village: string;
  faliya: string;
  totalMembers?: string;

  image?: string;
  addedBy?: string; // Sometimes shown in images
  createdAt?: string;

  // Bhagoria Specific
  date?: string;
  day?: string;
  bhagoriaHat?: string;
  numberOfDol?: string;
  inChargeName?: string;
  mobileNumber?: string;
  remark?: string;
}

export interface ISamitiResponse {
  data: ISamitiData[];
  count: number;
  total: number; // or filteredCount
  page: number;
  limit: number;
  filteredCount?: number;
}
