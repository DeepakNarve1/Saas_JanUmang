export interface IPanchayatFormValues {
  name: string;
  state: string;
  division: string;
  district?: string;
  parliament: string;
  assembly: string;
  block: string;
  booth: string;
  year?: string;
}

export interface IPanchayat {
  _id: string;
  name: string;
  state?: string | { _id: string; name: string };
  division?: string | { _id: string; name: string };
  district?: string | { _id: string; name: string };
  parliament?: string | { _id: string; name: string };
  assembly?: string | { _id: string; name: string };
  block?: string | { _id: string; name: string };
  booth?: string | { _id: string; name: string };
  year?: string;
  // Add other potentially populated fields if known
  createdAt?: string;
  updatedAt?: string;
}

export interface IPanchayatResponse {
  success: boolean;
  data: IPanchayat[];
  count: number;
  filteredCount: number;
  total?: number;
  page?: number;
  limit?: number;
}
