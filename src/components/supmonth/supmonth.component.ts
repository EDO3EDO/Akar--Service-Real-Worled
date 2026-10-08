import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PaymentService } from '../../services/payment.service';
import { PaymentPayload, PaymentResponse } from '../../interface/PaymentData';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { LocationSavedService } from '../../services/locationSaved.service';
import { Location } from '../../interface/Location';


@Component({
  selector: 'app-supmonth',
  templateUrl: './supmonth.component.html',
  imports:[TranslateModule],
  styleUrls: ['./supmonth.component.css']
})
export class SupmonthComponent implements OnInit {

  constructor() { }
  private LocationSer = inject(LocationSavedService)


  ShowLocation = signal<any>(null)


  ngOnInit(): void{


        const clientId = this.Auth.currentUser?.uid



    if(clientId){
      this.LocationSer.getItem(clientId).subscribe({
        next: (data) => {
          console.log('Its Not Here',data)
          if(data){
            this.ShowLocation.set(data)
          }
        },
        error: (err) => console.log(err)
      })
    }

    //




  }




private paymobService = inject(PaymentService);
private sanitizer = inject(DomSanitizer);
private Auth = inject(Auth)

  loading = signal<boolean>(false);
  selectedPlan = signal<'basic' | 'premium' | null>(null);
  iframeUrl = signal<SafeResourceUrl | null>(null);

  pay(planId: 'basic' | 'premium', amount: number) {
    this.loading.set(true);
    this.selectedPlan.set(planId);
    this.iframeUrl.set(null);

    const paymentData: PaymentPayload = {
      amount: amount,
      user: {
        uid: this.Auth.currentUser?.uid || 'hello',
        email: this.Auth.currentUser?.email || 'tedfdt@example.com',
        name: this.Auth.currentUser?.displayName || 'أحمد مح',
        phone: this.Auth.currentUser?.phoneNumber || '0100040000'
      },
      planInfo: {
        planId: planId,
        billingCycle: 'monthly'
      },
    };

    this.paymobService.getPaymentKey(paymentData).subscribe({
      next: (res: PaymentResponse) => {
        const iframeId = '1064661';
        const rawUrl = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${res.paymentKey}`;

        this.iframeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl));
        this.loading.set(false);
      },
      error: (err) => {
        console.error('فشل في جلب مفتاح الدفع:', err);
        this.loading.set(false);
      }
    });
  }
}
