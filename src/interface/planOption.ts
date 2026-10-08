export interface PlanOption {
  id: 'basic' | 'premium';
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  discountPercentage: number;
  quta: PlanQuota;
  history:PlanHistory;
}


export interface PlanQuota {
  freeVisits: number;
  acMaintenanceCount: number;
}

export interface PlanHistory {
  freeVisitsHistory: number;
  acMaintenanceCountHistory: number;
}
