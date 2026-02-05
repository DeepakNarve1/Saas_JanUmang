export interface IPublicProblemFormValues {
  regNo: string;
  submissionDate: string;
  year: string;
  month: string;
  dateString: string;
  district: string;
  assembly: string;
  block: string;
  recommendedLetterNo: string;
  boothNo: string;
  boothName: string;
  panchayatName: string;
  village: string;
  majraFaliya: string;
  workProblem: string;
  office: string;
  approximateCost: string;
  department: string;
  priority: string;
  typeOfWork: string;
  middleMen: string;
  middleMenContactNo: string;
  beneficialName: string;
  beneficialMobile: string;
  status: string;
  remarkGoshana: string;
  remarkTipUsd: string;
  addedBy: string;
  avedan: string;
}

export interface IPublicProblem {
  _id: string;
  srNo?: string;
  regNo: string;
  submissionDate: string;
  year: string;
  month: string;
  dateString: string;
  district: string;
  assembly: string;
  block: string;
  recommendedLetterNo: string;
  boothNo: string;
  boothName: string;
  panchayatName: string;
  village: string;
  majraFaliya: string;
  workProblem: string;
  office: string;
  approximateCost: string;
  department: string;
  priority: string;
  typeOfWork: string;
  middleMen: string;
  middleMenContactNo: string;
  beneficialName: string;
  beneficialMobile: string;
  status: string;
  remarkGoshana: string;
  remarkTipUsd: string;
  addedBy: string;
  avedan: string;
  startLat?: number;
  startLong?: number;
  savedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IPublicProblemResponse {
  data: IPublicProblem[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
