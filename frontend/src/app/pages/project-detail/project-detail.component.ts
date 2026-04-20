import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectsService, Project } from '../../services/projects.service';
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

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService
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
      },
      error: (err) => {
        this.error = 'تعذر تحميل بيانات المشروع. ربما تم حذفه أو الرابط غير صحيح.';
        this.loading = false;
      }
    });
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
