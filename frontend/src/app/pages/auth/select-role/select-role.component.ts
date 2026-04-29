import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="role-page" dir="rtl">
      <div class="role-card">
        <h1>أهلاً بك فى DGI Assets 👋</h1>
        <p class="sub">اختر كيف تنوى استخدام المنصة - تقدر تغيّرها لاحقاً من الإعدادات.</p>

        <div class="roles-grid">
          <button class="role-option" [class.active]="selected === 'buyer'" (click)="selected = 'buyer'">
            <div class="role-icon">🛒</div>
            <h3>مشترى</h3>
            <p>أبحث عن أصول رقمية لشرائها واستثمارها</p>
            <ul>
              <li>تصفّح الأصول المعروضة</li>
              <li>تقديم عروض شراء</li>
              <li>متابعة صفقاتى</li>
            </ul>
          </button>

          <button class="role-option" [class.active]="selected === 'seller'" (click)="selected = 'seller'">
            <div class="role-icon">💼</div>
            <h3>بائع</h3>
            <p>أمتلك أصول رقمية وأود بيعها بضمان كامل</p>
            <ul>
              <li>إضافة أصولى للبيع</li>
              <li>استقبال عروض المشترين</li>
              <li>تقييم AI لأصلى</li>
            </ul>
          </button>
        </div>

        <div *ngIf="error" class="alert-error">{{ error }}</div>

        <button class="btn-confirm" [disabled]="!selected || loading" (click)="confirm()">
          {{ loading ? 'جارى الحفظ...' : 'تأكيد ومتابعة ←' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .role-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background: radial-gradient(ellipse at center, #1a3d7a 0%, #0a1628 70%);
    }
    .role-card {
      max-width: 900px;
      width: 100%;
      background: rgba(255,255,255,0.96);
      border-radius: 24px;
      padding: 3rem 2rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 { color: #0f172a; margin: 0 0 0.5rem; font-size: 2rem; font-weight: 800; }
    .sub { color: #64748b; margin: 0 0 2.5rem; font-size: 1rem; }
    .roles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .role-option {
      background: #fff;
      border: 2px solid #e2e8f0;
      border-radius: 16px;
      padding: 1.75rem 1.25rem;
      cursor: pointer;
      transition: all 0.2s;
      text-align: right;
    }
    .role-option:hover { border-color: #3b6cb5; transform: translateY(-3px); box-shadow: 0 8px 20px rgba(26,61,122,0.12); }
    .role-option.active {
      border-color: #1a3d7a;
      background: linear-gradient(135deg, rgba(26,61,122,0.05), rgba(96,165,250,0.08));
      box-shadow: 0 8px 24px rgba(26,61,122,0.2);
    }
    .role-icon { font-size: 3rem; margin-bottom: 0.5rem; }
    .role-option h3 { color: #1a3d7a; margin: 0.5rem 0; font-size: 1.5rem; }
    .role-option > p { color: #475569; margin: 0 0 1rem; font-size: 0.95rem; }
    .role-option ul { list-style: none; padding: 0; margin: 0; text-align: right; }
    .role-option li { color: #64748b; padding: 0.35rem 0; font-size: 0.88rem; }
    .role-option li::before { content: '✓ '; color: #10b981; font-weight: 700; }

    .btn-confirm {
      background: linear-gradient(135deg, #1a3d7a 0%, #0a1628 100%);
      color: #fff;
      border: none;
      padding: 1rem 2.5rem;
      border-radius: 12px;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-confirm:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,61,122,0.4); }
    .btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

    .alert-error {
      background: #fee2e2;
      color: #dc2626;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      margin-bottom: 1rem;
    }
  `],
})
export class SelectRoleComponent {
  selected: 'buyer' | 'seller' | null = null;
  loading = false;
  error = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
  ) {}

  confirm() {
    if (!this.selected) return;
    this.loading = true;
    this.error = '';

    this.http.post<any>(`${environment.apiUrl}/auth/select-role`, { role: this.selected }).subscribe({
      next: (res) => {
        // Refresh user in localStorage
        const token = this.authService.getToken();
        if (token) {
          this.authService.loginWithToken(token).subscribe(() => {
            this.router.navigate(['/dashboard']);
          });
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'حدث خطأ، حاول مجدداً';
        this.loading = false;
      },
    });
  }
}
