export interface ITenant {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  plan?: string;
  createdAt?: string;
}

export interface ITenantResponse {
  success: boolean;
  data: ITenant[];
}
