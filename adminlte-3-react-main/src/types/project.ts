export interface IProjectFormValues {
  district: string;
  block: string;
  department: string;
  workName: string;
  projectCost: string | number;
  proposalEstimate: string | number;
  tsNoDate: string;
  asNoDate: string;
  status: string;
  officerName: string;
  contactNumber: string;
  remarks: string;
  currentProgress?: string;
  createdAt?: string;
}
