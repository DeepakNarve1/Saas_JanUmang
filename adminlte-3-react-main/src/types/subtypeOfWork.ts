export interface ISubTypeOfWorkFormValues {
  typeOfWork: string;
  subTypeOfWork: string;
}

export interface ISubTypeOfWork {
  _id: string;
  typeOfWork: string;
  subTypeOfWork: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubTypeOfWorkResponse {
  success: boolean;
  data: ISubTypeOfWork[];
  count: number;
  filteredCount: number;
  total?: number;
  page?: number;
  limit?: number;
}
