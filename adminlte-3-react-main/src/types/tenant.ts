export interface ITenant {
  _id: string;
  name: string;
  slug: string;
  status:
    | "active"
    | "inactive"
    | "suspended"
    | "trialing" // Match backend convention
    | "cancelled"
    | "expired";
  plan?: string;
  createdAt?: string;
  maxUsers?: number;
  userCount?: number;
  subscriptionStatus?:
    | "active"
    | "trial"
    | "suspended"
    | "cancelled"
    | "expired";
  enabledModules?: string[];
  subscriptionEndDate?: string;
  razorpayCustomerId?: string;
  trialEndsAt?: string;
}

export interface ITenantResponse {
  success: boolean;
  data: ITenant[];
}
