import { AuthanticationService } from './../../services/Authantication.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-LogIn',
  imports: [TranslateModule, ReactiveFormsModule],
  templateUrl: './LogIn.component.html',
  styleUrls: ['./LogIn.component.css']
})
export class LogInComponent implements OnInit {

  constructor(private Authentcation: AuthanticationService, private _Router: Router) {
              this.IsLodingForLogIn.set(false)
  }

  showActive = signal<boolean>(false);
  massgeError: string = "";
  IsLoding = signal<boolean>(false);
  IsLodingForLogIn = signal<boolean>(true)

  SignIn = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
    password: new FormControl(null, [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!\%*?&]{8,}$/)])
  });

  ngOnInit() {
    this.Authentcation.getUserIsActive().subscribe({
      next: (data) => {
        if (data) {
          this.showActive.set(data);
        }
      },
      error: (err) => { console.log(`Is Active ${err}`);  }
    });
  }


GetSignIn(form: FormGroup) {
  if (this.SignIn.valid) {
    this.IsLoding.set(true);
    this.massgeError = '';
    const { email, password } = form.value;
    this.Authentcation.SignIn(email, password).subscribe({
      next: (res) => {
        this.IsLoding.set(false);
        this.Authentcation.getUserRole().subscribe({
          next: (role) => {
            if (role === 'worker' && this.showActive() === false) {
              this._Router.navigate(['/worker/active-w']);
            } else if (role === 'client' && this.showActive() === false) {
              this._Router.navigate(['/client/active']);
            } else if (role === 'client' && this.showActive() === true) {
              this._Router.navigate(['client/home']);
            } else if (role === 'admin') {
              this._Router.navigate(['/admin/adduser']);
            }
          }
        });
      },
      error: (err: any) => {
        this.IsLoding.set(false);
        console.log('Firebase Raw Error Object:', err);
        const code = err?.code || '';
        if (
          code === 'auth/invalid-credential' ||
          code === 'auth/wrong-password' ||
          code === 'auth/user-not-found' ||
          code === 'auth/invalid-email'
        ) {
          this.massgeError = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        } else if (code === 'auth/too-many-requests') {
          this.massgeError = 'تم حظر المحاولات مؤقتاً لكثرة المحاولات الخاطئة، يرجى المحاولة لاحقاً';
        } else if (code === 'auth/network-request-failed') {
          this.massgeError = 'تحقق من اتصالك بالإنترنت';
        } else {
          this.massgeError = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        }
      }
    });
  } else {
    this.SignIn.markAllAsTouched();
  }
}

  adduser() {
    this._Router.navigate(['/admin/adduser']);
  }

  getSignOut() {
    this.Authentcation.signout();
  }
}
