

export interface SubscriptionUsage {
  freeVisits: number;
  acMaintenanceCount: number;
}
export interface SubscriptionHistory {
  freeVisitsHistory: number;
  acMaintenanceCountHistory: number;
}



export interface AdminId{
  front:string,
  back:string
}


export interface UserSubscription {
  plan: 'free' | 'basic' | 'premium';
  billingCycle: 'monthly' | 'yearly' | 'none';
  status: 'active' | 'inactive' | 'expired';
  startDate?: string | null ;
  endDate?: string | null;
  usage:SubscriptionUsage;
  history:SubscriptionHistory;
}

export interface UserData  {
  uid: string;
  email: string;
  name: string;
  role: 'clint' | 'worker';
  job: string;
  photo: string;
  Bio: string;
  CreatDat: any;
  supscription?: UserSubscription;
}


export interface workerData {
  uid: string;
  email: string;
  name: string;
  job: string;
  photo: string;
  phone:string;
  Bio: string;
  CreatDat: any;
  front:string,
  back:string,
}
