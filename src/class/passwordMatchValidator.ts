import { AbstractControl, ValidationErrors } from "@angular/forms";

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password'), confirmPassword = control.get('confirmPassword');
  return (password && confirmPassword && password.value !== confirmPassword.value) ? { passwordMismatch: true } : null;
}
