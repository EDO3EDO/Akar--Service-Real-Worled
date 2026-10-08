import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { RecaptchaVerifier } from '@angular/fire/auth';
import { AuthanticationService } from '../../services/Authantication.service';
import { passwordMatchValidator } from '../../class/passwordMatchValidator';
import { SMSService } from '../../services/SMS.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-activeWorkerAcount',
  templateUrl: './activeWorkerAcount.component.html',
  imports:[ReactiveFormsModule , TranslateModule],
  styleUrls: ['./activeWorkerAcount.component.css']
})
export class ActiveWorkerAcountComponent implements OnInit {

ngAfterViewInit(): void {
    this.recaptchaVerifier = this.smsService.initRecaptcha('recaptcha-container');
  }
  private Authantication = inject(AuthanticationService);
  private smsService = inject(SMSService);
  private Router = inject(Router)

  isLoading = false;
  IsLodingActive = signal<boolean>(true)
  isloding = false;
  isOtpSent = false; // for otp timer
  recaptchaVerifier!: RecaptchaVerifier; // im not robot test
  userPhoto = signal<any>('Avatar.png')

  countdown = signal<number>(60); // number of scound for timer
  canResend = signal<boolean>(true);
  private timerInterval: any;

  // validation
  completeProfile = new FormGroup({
    fullName: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.pattern(/^[\u0600-\u06FFa-zA-Z\s]+$/)]),
    phone: new FormControl(null, [Validators.required, Validators.pattern(/^(01)[0125][0-9]{8}$/)]),
    otp: new FormArray([
      new FormControl('', [Validators.required, Validators.pattern(/^[0-9]$/)]),
      new FormControl('', [Validators.required, Validators.pattern(/^[0-9]$/)]),
      new FormControl('', [Validators.required, Validators.pattern(/^[0-9]$/)]),
      new FormControl('', [Validators.required, Validators.pattern(/^[0-9]$/)]),
      new FormControl('', [Validators.required, Validators.pattern(/^[0-9]$/)]),
      new FormControl('', [Validators.required, Validators.pattern(/^[0-9]$/)])
    ]),
    password: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/)]),
    confirmPassword: new FormControl(null, [Validators.required])
  }, { validators: passwordMatchValidator });

  ngOnInit() {
    this.IsLodingActive.set(false)
        //// user photo
    this.Authantication.getuserPhoto().subscribe({
      next:(data) => {
        if(data){
          this.userPhoto.set(data)
        }
      },
      error:(err) => { console.log(`loaded user Photo ${err}`);}
    })

  }



  get otpControls() {
    return (this.completeProfile.get('otp') as FormArray).controls;
  }

  // to add +20 to send code
  private get formattedPhoneNumber(): string {
    const rawPhone = this.completeProfile.get('phone')?.value || '';
    if (rawPhone.startsWith('0')) {
      return '+20' + rawPhone.substring(1);
    }
    return '+20' + rawPhone;
  }

  // to frowrd to another input otp
  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value && index < 5) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  // to back to another input otp
  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }

  // start after send code
  startTimer(seconds: number = 60) {
    this.canResend.set(false);
    this.countdown.set(seconds);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const current = this.countdown();
      if (current > 1) {
        this.countdown.set(current - 1);
      } else {
        this.canResend.set(true);
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  // send otp and cheack
  async onSendOTP() {
    const phoneControl = this.completeProfile.get('phone');
    if (phoneControl?.invalid) {
      phoneControl.markAsTouched();
      return;
    }

    try {
      this.isLoading = true;
      await this.smsService.sendOTP(this.formattedPhoneNumber, this.recaptchaVerifier);
      this.isOtpSent = true;
      this.startTimer(60);
      console.log('تم إرسال كود التأكيد إلى هاتفك بنجاح!');
    } catch (err) {
      console.error('فشل إرسال الكود:', err);
      console.log('حدث خطأ أثناء إرسال الكود. تأكد من صحة رقم الهاتف.');
    } finally {
      this.isLoading = false;
    }
  }

  async onResendOTP() {
    if (!this.canResend()) return;
    await this.onSendOTP();
  }

  // on submit update all value with fun
  async onSubmit() {
    if (this.completeProfile.invalid) {
      this.completeProfile.markAllAsTouched();
      return;
    }

    this.isloding = true;
    const fullName = this.completeProfile.value.fullName;
    const rawPhone = this.completeProfile.value.phone;
    const password = this.completeProfile.value.password;
    const otpValue = this.completeProfile.value.otp?.join('') || '';

    try {
      await this.smsService.verifyOTPAndUpdatePhone(otpValue, rawPhone!);

      if (fullName) await this.onNameChange(fullName);
      if (rawPhone) this.onPhoneChange(rawPhone);
      if (password) await this.onPasswordChange(password);
      await this.IsActiveChange();
      this.Router.navigate([('worker/workertask')])

      console.log('تم تفعيل الحساب وتحديث البيانات بنجاح!');
    } catch (err) {
      console.error('Error submitting form:', err);
      console.log('فشل تأكيد الرمز، برجاء التأكد من كتابة الكود بشكل صحيح.');
    } finally {
      this.isloding = false;
    }
  }



  // change data from '' => Real Value
  async onNameChange(name: string) {
    try { await this.Authantication.updateuserName(name); }
    catch { console.log('can not change name'); }
  }

  onPhoneChange(phone: string) {
    try { this.Authantication.updateuserPhone(phone); }
    catch { console.log('can not change phone'); }
  }

  async IsActiveChange() {
    try { await this.Authantication.UpdateUserIsActive(); }
    catch { console.log('IsActive not Changed'); }
  }

  async onPasswordChange(newPass: string) {
    try { await this.Authantication.updatePassowrd(newPass); }
    catch (err) { console.log(`can not change passowrd: ${err}`); }
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }




    onfileSelect(event:any){
      const file:File = event.target.files[0];
      if(file && file.type.startsWith('image/')){
        const reader = new FileReader();
        reader.onload = async (e:any) => {
          const baseUrl = e.target.result;
          this.userPhoto.set(baseUrl)
          try{
            this.Authantication.updateuserPhoto(baseUrl)
            console.log('file selected')
          }catch{
            console.log('file not selcted ')
          }
        }
        reader.readAsDataURL(file);
      }
    }




////image for IdWorker


  frontFile = signal<File | null>(null);
  backFile = signal<File | null>(null);


  frontPreview = signal<string | null>(null);
  backPreview = signal<string | null>(null);

  isUploading = signal<boolean>(false);

  onFrontSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.frontFile.set(file);
      this.frontPreview.set(URL.createObjectURL(file));
    }
  }


  onBackSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.backFile.set(file);
      this.backPreview.set(URL.createObjectURL(file));
    }
  }


  async onSaveId(frontInputFile: File, backInputFile: File) {
    this.isUploading.set(true);
    try {
      await this.Authantication.updateIdPhoto(frontInputFile, backInputFile);
      console.log('تم رفع وتحديث صور البطاقة بنجاح!');
    } catch (error) {
      console.error('حدث خطأ أثناء الرفع:', error);
    } finally {
      this.isUploading.set(false);
    }
  }


}
