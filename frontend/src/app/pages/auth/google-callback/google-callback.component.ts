import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="min-height:80vh;display:flex;align-items:center;justify-content:center;direction:rtl;">
      <div style="text-align:center;">
        <div class="spinner" style="width:48px;height:48px;border:4px solid #e2e8f0;border-top-color:#6c63ff;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 1rem;"></div>
        <p *ngIf="!error">جاري تسجيل الدخول...</p>
        <p *ngIf="error" style="color:#dc2626;">{{ error }}</p>
      </div>
    </div>
  `,
  styles: [`@keyframes spin { to { transform: rotate(360deg); } }`],
})
export class GoogleCallbackComponent implements OnInit {
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.error = 'فشل تسجيل الدخول بـ Google';
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }

    this.authService.loginWithToken(token).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'حدث خطأ. يرجى المحاولة مرة أخرى.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
    });
  }
}
