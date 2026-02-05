export interface IProjectFormValues {
  district: string;
  block: string;
  department: string;
  workName: string;
  projectCost: number;
  proposalEstimate: number;
  tsNoDate: string;
  asNoDate: string;
  status: string;
  officerName: string;
  contactNumber: string;
  remarks: string;
  currentProgress?: string;
}

export interface IProject {
  _id: string;
  district: string;
  block: string;
  department: string;
  workName: string;
  projectCost: number;
  proposalEstimate: number;
  tsNoDate: string;
  asNoDate: string;
  status: string;
  officerName: string;
  contactNumber: string;
  remarks: string;
  currentProgress?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IProjectResponse {
  data: IProject[];
  count: number;
  total: number;
  filteredCount?: number;
  page: number;
  limit: number;
}
