export interface PaymentDataSuc {
  orderId: string;
  packageName: string;
  amount: number;
  startDate: string | undefined | null;
  endDate: string | undefined | null;
  discount: number;
  freeVisits: number;
}
