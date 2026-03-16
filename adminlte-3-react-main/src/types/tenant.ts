export interface ITenant {
  _id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  plan: 'basic' | 'professional' | 'enterprise' | 'custom';
  enabledModules: string[];
  subscriptionStatus: 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  razorpayCustomerId?: string;
  razorpaySubscriptionId?: string;
  trialEndsAt?: string;
  maxUsers: number;
  userCount?: number;
  maxStorage: number;
  currentStorage: number;
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'trialing';
  owner?: string | { _id: string; name: string; email: string };
  settings?: {
    theme?: {
      primaryColor?: string;
      logoUrl?: string;
    };
    features?: {
      allowUserRegistration?: boolean;
      requireEmailVerification?: boolean;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ITenantResponse {
  data: ITenant[];
  total: number;
}
