import { Injectable, inject } from '@angular/core';
import {
  Auth,
  RecaptchaVerifier,
  linkWithPhoneNumber,
  ConfirmationResult
} from '@angular/fire/auth';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class SMSService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private confirmationResult: ConfirmationResult | null = null;

  constructor() { }

  // fun for the test => im not Robot
  initRecaptcha(containerId: string): RecaptchaVerifier {
    return new RecaptchaVerifier(this.auth, containerId, {
      size: 'invisible'
    });
  }

  // take phone and test for send otp with linkwithphoneNumber
  async sendOTP(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) throw new Error('لا يوجد مستخدم مسجل الدخول.');

    try {
      this.confirmationResult = await linkWithPhoneNumber(
        currentUser,
        phoneNumber,
        recaptchaVerifier
      );
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  // test if the code Right or not ==> if true == save phoe if fales == throw Error && update phone && pohneverified
  async verifyOTPAndUpdatePhone(otpCode: string, phoneNumber: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (!this.confirmationResult || !currentUser) {
      throw new Error('جلسة التأكيد غير صالحة.');
    }
    try {
      await this.confirmationResult.confirm(otpCode); // to check the otp from firebase fun
      const userDocRef = doc(this.firestore, `users/${currentUser.uid}`);
      await updateDoc(userDocRef, {
        phoneNumber: phoneNumber,
        isPhoneVerified: true
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }
}
