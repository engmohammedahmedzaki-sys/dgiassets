import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sell.component.html',
  styleUrl: './sell.component.css'
})
export class SellComponent {
  currentStep = 1;
  totalSteps = 4;

  // Form Data
  projectData = {
    // Step 1: Basic Info
    title: '',
    category: '',
    shortDescription: '',
    description: '',
    
    // Step 2: Metrics
    price: 0,
    isNegotiable: false,
    monthlyRevenue: 0,
    monthlyProfit: 0,
    monthlyVisitors: 0,
    activeUsers: 0,
    ageInMonths: 0,
    
    // Step 3: Details
    website: '',
    demoUrl: '',
    techStack: [] as string[],
    reasonForSelling: '',
    highlights: '',
    
    // Step 4: Media
    mainImage: '',
    images: [] as string[]
  };

  techStackInput = '';
  
  categories = [
    { value: 'ecommerce', label: 'تجارة إلكترونية', icon: '🛒' },
    { value: 'saas', label: 'SaaS', icon: '💻' },
    { value: 'mobile_app', label: 'تطبيقات موبايل', icon: '📱' },
    { value: 'content_site', label: 'مواقع محتوى', icon: '📝' },
    { value: 'education', label: 'تعليم أونلاين', icon: '🎓' },
    { value: 'games', label: 'ألعاب', icon: '🎮' },
    { value: 'other', label: 'أخرى', icon: '📦' }
  ];

  loading = false;
  error = '';
  aiValuation = 0;

  constructor(
    private projectsService: ProjectsService,
    private authService: AuthService,
    private router: Router
  ) {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  nextStep() {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step <= this.currentStep || this.validateCurrentStep()) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    this.error = '';
    
    switch (this.currentStep) {
      case 1:
        if (!this.projectData.title) {
          this.error = 'الرجاء إدخال عنوان المشروع';
          return false;
        }
        if (!this.projectData.category) {
          this.error = 'الرجاء اختيار فئة المشروع';
          return false;
        }
        if (!this.projectData.shortDescription) {
          this.error = 'الرجاء إدخال وصف مختصر';
          return false;
        }
        if (!this.projectData.description) {
          this.error = 'الرجاء إدخال وصف تفصيلي';
          return false;
        }
        break;
      
      case 2:
        if (!this.projectData.price || this.projectData.price <= 0) {
          this.error = 'الرجاء إدخال السعر المطلوب';
          return false;
        }
        break;
      
      case 3:
        // Optional step - no required fields
        break;
      
      case 4:
        // Media upload - optional for now
        break;
    }
    
    return true;
  }

  addTechStack() {
    if (this.techStackInput.trim()) {
      this.projectData.techStack.push(this.techStackInput.trim());
      this.techStackInput = '';
    }
  }

  removeTechStack(index: number) {
    this.projectData.techStack.splice(index, 1);
  }

  calculateAIValuation() {
    // TODO: Call AI API
    // For now, simple calculation based on revenue
    if (this.projectData.monthlyRevenue > 0) {
      this.aiValuation = this.projectData.monthlyRevenue * 24; // 2 years of revenue
    }
  }

  saveDraft() {
    // TODO: Save to localStorage or API
    localStorage.setItem('project_draft', JSON.stringify(this.projectData));
    alert('تم حفظ المسودة بنجاح');
  }

  loadDraft() {
    const draft = localStorage.getItem('project_draft');
    if (draft) {
      this.projectData = JSON.parse(draft);
      alert('تم تحميل المسودة');
    }
  }

  onSubmit() {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.projectsService.createProject(this.projectData).subscribe({
      next: (response) => {
        this.loading = false;
        alert('تم إضافة المشروع بنجاح!');
        localStorage.removeItem('project_draft');
        this.router.navigate(['/dashboard/seller']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'حدث خطأ أثناء إضافة المشروع';
        console.error('Error creating project:', err);
      }
    });
  }

  get progressPercentage(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }
}
