export interface IVillageFormValues {
  name: string;
  state: string;
  division: string;
  district?: string;
  parliament: string;
  assembly: string;
  block: string;
  booth: string;
  panchayat: string;
}

export interface IVillage {
  _id: string;
  name: string;
  state?: string | { _id: string; name: string };
  division?: string | { _id: string; name: string };
  district?: string | { _id: string; name: string };
  parliament?: string | { _id: string; name: string };
  assembly?: string | { _id: string; name: string };
  block?: string | { _id: string; name: string };
  panchayat?: string | { _id: string; name: string };
  booth?: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface IVillageResponse {
  success: boolean;
  data: IVillage[];
  count: number;
  filteredCount: number;
  total?: number;
  page?: number;
  limit?: number;
}
