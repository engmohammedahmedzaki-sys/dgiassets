import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DealsService } from '../../services/deals.service';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="callback-page" dir="rtl">
      <div class="callback-card" *ngIf="!done">
        <div class="spinner"></div>
        <p>جاري التحقق من الدفع...</p>
      </div>

      <div class="callback-card success" *ngIf="done && success">
        <div class="icon">✅</div>
        <h2>تم الدفع بنجاح!</h2>
        <p>تم تأكيد دفعتك. يمكنك الآن متابعة الصفقة.</p>
        <button class="btn" (click)="goToDeal()">الذهاب لغرفة الصفقة</button>
      </div>

      <div class="callback-card fail" *ngIf="done && !success">
        <div class="icon">❌</div>
        <h2>فشل الدفع</h2>
        <p>{{ errorMsg }}</p>
        <button class="btn secondary" routerLink="/dashboard">العودة للوحة التحكم</button>
      </div>
    </div>
  `,
  styles: [`
    .callback-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
    }
    .callback-card {
      background: #fff;
      border-radius: 16px;
      padding: 3rem 2.5rem;
      text-align: center;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .spinner {
      width: 52px; height: 52px;
      border: 4px solid #e2e8f0;
      border-top-color: #6c63ff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h2 { font-size: 1.4rem; font-weight: 700; margin: 0 0 0.75rem; }
    p { color: #64748b; margin: 0 0 1.5rem; }
    .btn {
      padding: 0.75rem 2rem; background: #6c63ff; color: #fff;
      border: none; border-radius: 8px; font-size: 1rem; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    .btn:hover { background: #5a52d5; }
    .btn.secondary { background: #f1f5f9; color: #334155; }
  `],
})
export class PaymentCallbackComponent implements OnInit {
  done = false;
  success = false;
  errorMsg = 'حدث خطأ أثناء الدفع. يرجى التواصل مع الدعم.';
  dealId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dealsService: DealsService,
  ) {}

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const moyasarId = params['id'];
    const status = params['status'];
    this.dealId = params['dealId'] ?? '';

    if (!moyasarId || status === 'failed') {
      this.done = true;
      this.success = false;
      this.errorMsg = 'تم إلغاء الدفع أو فشله.';
      return;
    }

    if (this.dealId) {
      this.dealsService.confirmPayment(this.dealId, moyasarId).subscribe({
        next: () => {
          this.done = true;
          this.success = true;
        },
        error: () => {
          this.done = true;
          this.success = false;
        },
      });
    } else {
      this.done = true;
      this.success = status === 'paid';
    }
  }

  goToDeal() {
    this.router.navigate(['/deals', this.dealId]);
  }
}
