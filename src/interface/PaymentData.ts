export interface PaymentPayload {
  paymentType?: "subscription" | "service";
  amount?: number;
  user: {
    uid: string;
    email: string;
    name: string;
    phone?: string;
  };


  serviceInfo?: {
    serviceId?: string;
    type?: "ser" | "card";
    icon?: string;
    serviceTitle?: string;
    visitDate?: string;
    visitTime?: string;
  };
  planInfo?: {
    planId: string;
    billingCycle: "monthly" | "yearly";
    amount?: number;
  };
}

export interface PaymentResponse {
  paymentKey: string;
  orderId?: string;
}
