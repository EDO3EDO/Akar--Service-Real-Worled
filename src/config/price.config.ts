import { PlanOption } from "../interface/planOption";


export const PRICING: PlanOption[] = [
  {
    id: 'basic',
    name: 'الباقة الاقتصادية',
    description: 'مناسبة للعملاء الجدد والميزات الأساسية',
    monthlyPrice: 100,
    yearlyPrice: 1000,
    discountPercentage: 20,
    quta: {
      freeVisits: 2,
      acMaintenanceCount: 1
    },
    history:{
      freeVisitsHistory:0,
      acMaintenanceCountHistory: 0
    }
  },
  {
    id: 'premium',
    name: 'الباقة المميزة (VIP)',
    description: 'أفضل قيمة مع جميع المزايا والدعم السريع',
    monthlyPrice: 250,
    yearlyPrice: 2400,
    discountPercentage: 30,
    quta: {
      freeVisits: 4,
      acMaintenanceCount: 2
    },
    history:{
        freeVisitsHistory: 0,
        acMaintenanceCountHistory: 0
    }
  }
];
