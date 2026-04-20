import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DealsService, Deal, DealStatus } from '../../services/deals.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-deal-room',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './deal-room.component.html',
  styleUrls: ['./deal-room.component.css'],
})
export class DealRoomComponent implements OnInit {
  deal: Deal | null = null;
  loading = true;
  actionLoading = false;
  error = '';
  successMsg = '';

  disputeReason = '';
  transferNotes = '';
  showDisputeForm = false;
  showTransferForm = false;

  currentUserId = '';

  steps = [
    { label: 'الدفع', icon: '💳' },
    { label: 'تأكيد الدفع', icon: '✅' },
    { label: 'نقل الملكية', icon: '📦' },
    { label: 'الفحص', icon: '🔍' },
    { label: 'مكتمل', icon: '🎉' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dealsService: DealsService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUser()?.id ?? '';
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDeal(id);
  }

  loadDeal(id: string) {
    this.loading = true;
    this.dealsService.getDeal(id).subscribe({
      next: (deal) => {
        this.deal = deal;
        this.loading = false;
      },
      error: () => {
        this.error = 'لا يمكن تحميل الصفقة';
        this.loading = false;
      },
    });
  }

  get isBuyer() {
    return this.deal?.buyerId === this.currentUserId;
  }

  get isSeller() {
    return this.deal?.sellerId === this.currentUserId;
  }

  get currentStep(): number {
    return this.dealsService.getStatusStep(
      this.deal?.status as DealStatus,
    );
  }

  getStatusLabel(s: DealStatus) {
    return this.dealsService.getStatusLabel(s);
  }

  startTransfer() {
    if (!this.deal) return;
    this.actionLoading = true;
    this.dealsService
      .startTransfer(this.deal.id, this.transferNotes)
      .subscribe({
        next: (d) => {
          this.deal = d;
          this.actionLoading = false;
          this.showTransferForm = false;
          this.successMsg = 'تم بدء نقل الملكية بنجاح';
        },
        error: (e) => {
          this.error = e.error?.message ?? 'حدث خطأ';
          this.actionLoading = false;
        },
      });
  }

  completeDeal() {
    if (!this.deal) return;
    this.actionLoading = true;
    this.dealsService.completeDeal(this.deal.id).subscribe({
      next: (d) => {
        this.deal = d;
        this.actionLoading = false;
        this.successMsg = 'تم إتمام الصفقة بنجاح! مبروك 🎉';
      },
      error: (e) => {
        this.error = e.error?.message ?? 'حدث خطأ';
        this.actionLoading = false;
      },
    });
  }

  submitDispute() {
    if (!this.deal || !this.disputeReason.trim()) return;
    this.actionLoading = true;
    this.dealsService.openDispute(this.deal.id, this.disputeReason).subscribe({
      next: (d) => {
        this.deal = d;
        this.actionLoading = false;
        this.showDisputeForm = false;
        this.successMsg = 'تم فتح النزاع. سيتواصل معك الفريق قريباً';
      },
      error: (e) => {
        this.error = e.error?.message ?? 'حدث خطأ';
        this.actionLoading = false;
      },
    });
  }

  goToPayment() {
    if (this.deal) this.router.navigate(['/payment/callback'], {
      queryParams: { dealId: this.deal.id },
    });
  }
}
