export interface IPlan {
  _id: string;
  planId: string;
  name: string;
  description: string;
  priceMonthlyPaise: number;
  priceYearlyPaise: number;
  razorpayPlanIdMonthly?: string;
  razorpayPlanIdYearly?: string;
  maxUsers: number;
  maxStorage: number;
  enabledModules: string[];
  features: string[];
  color: string;
  icon?: string;
  highlighted: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IModuleConfig {
  id: string;
  name: string;
  category: string;
  description?: string;
}
