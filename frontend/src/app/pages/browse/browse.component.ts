import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService, Project, ProjectFilters } from '../../services/projects.service';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './browse.component.html',
  styleUrl: './browse.component.css'
})
export class BrowseComponent implements OnInit {
  projects: Project[] = [];
  loading = false;
  totalProjects = 0;
  currentPage = 1;
  totalPages = 1;
  pageSize = 12;

  filters: ProjectFilters = {
    search: '',
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
    page: 1,
    limit: 12
  };

  sortBy = 'newest';
  filtersOpen = false;
  selectedProject: Project | null = null;

  categories = [
    { value: '', label: 'الكل', icon: '📂' },
    { value: 'domains', label: 'دومينات', icon: '🌐' },
    { value: 'websites', label: 'مواقع إلكترونية', icon: '🖥️' },
    { value: 'ecommerce', label: 'متاجر إلكترونية', icon: '🛒' },
    { value: 'mobile_apps', label: 'تطبيقات موبايل', icon: '📱' },
    { value: 'saas', label: 'برمجيات SaaS', icon: '☁️' },
    { value: 'digital_accounts', label: 'حسابات رقمية', icon: '📲' },
    { value: 'digital_content', label: 'محتوى رقمي', icon: '📚' },
    { value: 'branding', label: 'علامات تجارية', icon: '🏷️' },
    { value: 'databases', label: 'قواعد بيانات', icon: '🗄️' },
    { value: 'games', label: 'ألعاب وأصول الألعاب', icon: '🎮' },
    { value: 'intellectual_property', label: 'ملكية فكرية', icon: '💡' },
    { value: 'services', label: 'خدمات رقمية', icon: '🔧' },
    { value: 'other', label: 'أخرى', icon: '📦' }
  ];

  pricePresets = [
    { label: 'أقل من $5K', min: 0, max: 5000 },
    { label: '$5K - $50K', min: 5000, max: 50000 },
    { label: '$50K - $200K', min: 50000, max: 200000 },
    { label: 'أكثر من $200K', min: 200000, max: undefined },
  ];

  constructor(
    private projectsService: ProjectsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.projectsService.getProjects(this.filters).subscribe({
      next: (response) => {
        this.projects = response.projects;
        this.totalProjects = response.total;
        this.totalPages = Math.ceil(response.total / this.pageSize);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.loading = false;
      }
    });
  }

  onFiltersChange() {
    this.currentPage = 1;
    this.filters.page = 1;
    this.loadProjects();
  }

  onSortChange() {
    this.loadProjects();
  }

  resetFilters() {
    this.filters = {
      search: '',
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
      page: 1,
      limit: 12
    };
    this.sortBy = 'newest';
    this.currentPage = 1;
    this.loadProjects();
  }

  applyPricePreset(preset: any) {
    this.filters.minPrice = preset.min;
    this.filters.maxPrice = preset.max;
    this.onFiltersChange();
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.filters.search) count++;
    if (this.filters.category) count++;
    if (this.filters.minPrice !== undefined) count++;
    if (this.filters.maxPrice !== undefined) count++;
    return count;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.filters.page = page;
    this.loadProjects();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  openProject(id: string) {
    this.router.navigate(['/projects', id]);
  }

  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }
}
