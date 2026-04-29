import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ProjectsService, Project } from '../../services/projects.service';
import { NdaService } from '../../services/nda.service';
import { AuthService } from '../../services/auth.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  loading = true;
  error = '';
  activeImage = '';

  // NDA state
  ndaSigned = false;
  ndaSigning = false;
  showNdaModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private ndaService: NdaService,
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
      },
      error: (err) => {
        this.error = 'تعذر تحميل بيانات المشروع. ربما تم حذفه أو الرابط غير صحيح.';
        this.loading = false;
      }
    });
  }

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
