import { Injectable, inject } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { Observable, from } from 'rxjs';
import { PaymentPayload, PaymentResponse } from '../interface/PaymentData';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private functions = inject(Functions);

  constructor() {}

  getPaymentKey(payload: PaymentPayload): Observable<PaymentResponse> {
    const generatePaymentKeyFn = httpsCallable<PaymentPayload, PaymentResponse>(
      this.functions,
      'generatePaymobPaymentKey'
    );

    return from(
      generatePaymentKeyFn(payload).then(result => result.data as PaymentResponse)
    );
  }
}
