import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { SettingsService, SiteSettings } from './services/settings.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
  showLayout = true;
  mobileMenuOpen = false;
  settings: SiteSettings | null = null;

  constructor(
    public router: Router,
    private settingsService: SettingsService,
    public authService: AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Hide header/footer for dashboard and auth pages
      const hiddenRoutes = ['/dashboard', '/login', '/register'];
      this.showLayout = !hiddenRoutes.some(route => event.url.startsWith(route));
      // Close mobile menu on navigation
      this.mobileMenuOpen = false;
    });

    this.settingsService.settings$.subscribe(s => this.settings = s);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  logoutAndRedirect() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
