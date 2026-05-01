import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  userData = {
    fullName: '',
    email: '',
    phoneNumber: '',
    whatsappNumber: '',
    password: '',
    role: 'buyer'
  };

  // Phone fields
  selectedCountryCode = '+966';
  phoneNumberLocal = '';
  whatsappCountryCode = '+966';
  whatsappNumberLocal = '';
  sameAsPhone = false;

  confirmPassword = '';
  agreedToTerms = false;
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSameAsPhoneChange() {
    if (this.sameAsPhone) {
      this.whatsappCountryCode = this.selectedCountryCode;
      this.whatsappNumberLocal = this.phoneNumberLocal;
    }
  }

  getPasswordStrength(): string {
    const password = this.userData.password;
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'medium';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    const texts: { [key: string]: string } = {
      'weak': 'ضعيفة',
      'medium': 'متوسطة',
      'strong': 'قوية'
    };
    return texts[strength];
  }

  signUpWithGoogle() {
    this.authService.loginWithGoogle();
  }

  private isValidEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  }

  onSubmit() {
    // Validation
    if (!this.userData.email || !this.isValidEmail(this.userData.email)) {
      this.error = 'البريد الإلكتروني غير صالح';
      return;
    }

    if (this.userData.password !== this.confirmPassword) {
      this.error = 'كلمتا المرور غير متطابقتين';
      return;
    }

    if (!this.agreedToTerms) {
      this.error = 'يجب الموافقة على الشروط والأحكام';
      return;
    }

    if (this.userData.password.length < 6) {
      this.error = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      return;
    }

    if (!this.phoneNumberLocal || this.phoneNumberLocal.length < 6) {
      this.error = 'رقم الهاتف غير صالح';
      return;
    }

    // Combine phone with country code
    this.userData.phoneNumber = this.selectedCountryCode + this.phoneNumberLocal;

    // Combine WhatsApp with country code
    if (this.whatsappNumberLocal) {
      this.userData.whatsappNumber = this.whatsappCountryCode + this.whatsappNumberLocal;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.userData)
      .subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Registration successful:', response);
          alert('تم إنشاء الحساب بنجاح! ' + response.message);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
          console.error('Registration error:', err);
        }
      });
  }
}
