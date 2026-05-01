import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };

  rememberMe = false;
  loading = false;
  error = '';
  showPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  signInWithGoogle() {
    this.authService.loginWithGoogle();
  }

  private isValidEmail(email: string): boolean {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  }

  onSubmit() {
    if (!this.credentials.email || !this.isValidEmail(this.credentials.email)) {
      this.error = 'البريد الإلكتروني غير صالح';
      return;
    }
    if (!this.credentials.password) {
      this.error = 'كلمة المرور مطلوبة';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.credentials.email, this.credentials.password)
      .subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Login successful:', response);

          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'حدث خطأ أثناء تسجيل الدخول';
          console.error('Login error:', err);
        }
      });
  }
}
