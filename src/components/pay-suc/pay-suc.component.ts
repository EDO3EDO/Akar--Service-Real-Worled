import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SupscribtionService } from '../../services/Supscribtion.service';
import { PaymentDataSuc } from '../../interface/paymentDataSuc';

@Component({
  selector: 'app-pay-suc',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pay-suc.component.html',
  styleUrls: ['./pay-suc.component.css']
})
export class PaySucComponent implements OnInit {

  constructor() { }

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public subService = inject(SupscribtionService);

  // إدارة حالات الواجهة
  isLoading = signal<boolean>(true);
  isSuccess = signal<boolean>(false);

  // بيانات الفاتورة المعروضة
  invoiceData = signal<PaymentDataSuc | null>(null);

async ngOnInit() {
  if (window.self !== window.top) {
    window.top!.location.href = window.location.href;
    return;
  }

  const params = this.route.snapshot.queryParams;

  if (params['success'] === 'true' || params['txn_response_code'] === 'APPROVED') {
    const merchantOrderId: string = params['merchant_order_id'] || '';
    const orderParts = merchantOrderId.split('_');

    const planType = (orderParts[1] as 'basic' | 'premium') || 'basic';
    const rawCycle = orderParts[2] || '';
    const cycle: 'monthly' | 'yearly' = rawCycle.includes('year') ? 'yearly' : 'monthly';

    const amountCents = Number(params['amount_cents']) || 0;

    try {
      await this.subService.activateSupscribtion(cycle, planType);
      const currentUserData: any = this.subService.currentuser();
      const sub = currentUserData?.supscription;

      const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      const amount = amountCents > 0 ? amountCents / 100 : this.subService.getPrice(planType, cycle);
      this.invoiceData.set({
        orderId: params['id'] || params['order'] || 'AK-89241',
        packageName: planType === 'premium' ? 'الباقة المميزة المتقدمة' : 'الباقة الاقتصادية',
        amount: amount,
        startDate: formatDate(sub?.startDate),
        endDate: formatDate(sub?.endDate),
        discount: this.subService.getDiscound(),
        freeVisits: sub?.usage?.acMaintenanceCount ?? (planType === 'premium' ? 3 : 1)
      });

      this.isSuccess.set(true);
    } catch (error) {
      console.error('خطأ أثناء تفعيل الاشتراك:', error);
      this.isSuccess.set(false);
    } finally {
      this.isLoading.set(false);
    }
  } else {
    this.isLoading.set(false);
    this.isSuccess.set(false);
  }
}

  downloadInvoice() {
    window.print();
  }

  goToDashboard() {
    this.router.navigate(['/client/dashboard']);
  }

  retryPayment() {
    this.router.navigate(['/client/sup/supmonth']);
  }

}
