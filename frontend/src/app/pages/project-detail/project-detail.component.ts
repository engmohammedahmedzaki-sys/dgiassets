import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ProjectsService, Project } from '../../services/projects.service';
import { NdaService } from '../../services/nda.service';
import { BidsService, Bid } from '../../services/bids.service';
import { AuthService } from '../../services/auth.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {
  project: Project | null = null;
  loading = true;
  error = '';
  activeImage = '';

  // NDA state
  ndaSigned = false;
  ndaSigning = false;
  showNdaModal = false;

  // Auction state
  bids: Bid[] = [];
  bidsLoading = false;
  bidAmount: number | null = null;
  bidPlacing = false;
  bidError = '';
  bidSuccess = '';
  countdown = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false };
  private countdownTimer: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private ndaService: NdaService,
    private bidsService: BidsService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProject(id);
      }
    });
  }

  ngOnDestroy() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  loadProject(id: string) {
    this.loading = true;
    this.projectsService.getProject(id).subscribe({
      next: (project) => {
        this.project = project;
        this.activeImage = project.mainImage || 'assets/placeholder-project.png';
        this.loading = false;
        // Check NDA status if user is logged in
        if (this.authService.isLoggedIn() && (project as any).requiresNda) {
          this.ndaService.getStatus(id).subscribe(res => this.ndaSigned = res.signed);
        }
        // Auction setup
        if (project.listingType === 'auction') {
          this.startCountdown();
          this.loadBids();
          this.bidAmount = this.suggestedNextBid();
        }
      },
      error: (err) => {
        this.error = 'تعذر تحميل بيانات المشروع. ربما تم حذفه أو الرابط غير صحيح.';
        this.loading = false;
      }
    });
  }

  // ========= Auction =========
  get isAuction(): boolean {
    return this.project?.listingType === 'auction';
  }

  get isAuctionEnded(): boolean {
    if (!this.project?.auctionEndsAt) return false;
    return new Date(this.project.auctionEndsAt).getTime() <= Date.now() ||
      !!this.project.auctionFinalized;
  }

  get isOwner(): boolean {
    const me = this.authService.getCurrentUser() as any;
    return !!me && me.id === this.project?.owner?.id;
  }

  get hasWinner(): boolean {
    return !!(this.project?.currentHighBid && this.project?.currentHighBidderId);
  }

  suggestedNextBid(): number {
    if (!this.project) return 0;
    const high = Number(this.project.currentHighBid ?? 0);
    if (high > 0) {
      // suggest 5% higher (rounded to nearest 100)
      return Math.ceil((high * 1.05) / 100) * 100;
    }
    return Number(this.project.minBid ?? 0);
  }

  minBidAllowed(): number {
    if (!this.project) return 0;
    const high = Number(this.project.currentHighBid ?? 0);
    if (high > 0) return high + 1;
    return Number(this.project.minBid ?? 1);
  }

  startCountdown() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    this.tickCountdown();
    this.countdownTimer = setInterval(() => this.tickCountdown(), 1000);
  }

  private tickCountdown() {
    if (!this.project?.auctionEndsAt) {
      this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return;
    }
    const ends = new Date(this.project.auctionEndsAt).getTime();
    const diff = ends - Date.now();
    if (diff <= 0) {
      this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    this.countdown = { days, hours, minutes, seconds, expired: false };
  }

  loadBids() {
    if (!this.project) return;
    this.bidsLoading = true;
    this.bidsService.getBids(this.project.id).subscribe({
      next: (bids) => {
        this.bids = bids;
        this.bidsLoading = false;
      },
      error: () => { this.bidsLoading = false; },
    });
  }

  placeBid() {
    if (!this.project) return;
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.bidError = '';
    this.bidSuccess = '';

    const amount = Number(this.bidAmount);
    if (!amount || amount < this.minBidAllowed()) {
      this.bidError = `الحد الأدنى للمزايدة الآن: ${this.minBidAllowed().toLocaleString('ar-EG')} ر.س`;
      return;
    }

    this.bidPlacing = true;
    this.bidsService.placeBid(this.project.id, amount).subscribe({
      next: (res) => {
        this.bidPlacing = false;
        this.bidSuccess = `✅ تمّت مزايدتك بنجاح بقيمة ${amount.toLocaleString('ar-EG')} ر.س`;
        // Refresh project + bids
        this.loadProject(this.project!.id);
        setTimeout(() => this.bidSuccess = '', 4000);
      },
      error: (err) => {
        this.bidPlacing = false;
        this.bidError = err.error?.message || 'تعذّر تسجيل المزايدة';
      },
    });
  }
  // ========= /Auction =========

  openNdaModal() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.showNdaModal = true;
  }

  signNda() {
    if (!this.project) return;
    this.ndaSigning = true;
    this.ndaService.sign(this.project.id).subscribe({
      next: () => {
        this.ndaSigned = true;
        this.ndaSigning = false;
        this.showNdaModal = false;
        this.loadProject(this.project!.id);
      },
      error: () => { this.ndaSigning = false; },
    });
  }

  get isNdaMasked(): boolean {
    return !!(this.project as any)?._ndaRequired;
  }

  get isOwnerVerified(): boolean {
    return this.project?.owner?.kycStatus === 'verified';
  }

  setActiveImage(img: string) {
    this.activeImage = img;
  }

  getMultiple(): number {
    if (this.project?.price && this.project?.monthlyProfit && this.project.monthlyProfit > 0) {
      return Number((this.project.price / this.project.monthlyProfit).toFixed(1));
    }
    return 0;
  }
}
