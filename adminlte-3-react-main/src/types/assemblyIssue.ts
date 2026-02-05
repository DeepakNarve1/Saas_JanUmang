export interface IAssemblyIssueFormValues {
  uniqueId: string;
  sectorName: string;
  microSectorNo: string;
  microSectorName: string;
  year: string;
  month: string;
  date: string;
  district: string;
  assembly: string;
  acMpNo: string;
  block: string;
  recommendedLetterNo: string;
  boothName: string;
  boothNo: string;
  panchayatName: string;
  village: string;
  majraFaliya: string;
  workProblem: string;
  office: string;
  approximateCost: number;
  department: string;
  priority: string;
  tsNoDate: string;
  asNoDate: string;
  typeOfWork: string;
  subWorkType: string;
  middleMen: string;
  middleManContact: string;
  beneficiaryName: string;
  beneficiaryContact: string;
  po: string;
  avedanFile?: string;
  avedanFileName?: string;
  accountDetails: string;
  adharCardNumber: string;
  ifscNumber: string;
  documentFile?: string;
  documentFileName?: string;
  remarkGoshana: string;
  remarkTipUsd?: string; // Optional if not in form
  addedBy?: string; // Likely handled by backend context, but good to have
  latLng?: string;
  totalMembers?: number;
  registrationDate?: string;
  status?: string;
  issueType?: string;
}

export interface IAssemblyIssue extends IAssemblyIssueFormValues {
  _id: string;
  srNo?: number; // Calculated on frontend
  timer?: string; // Derived/Calculated
  createdAt: string;
  updatedAt: string;
}

export interface IAssemblyIssueResponse {
  data: IAssemblyIssue[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
