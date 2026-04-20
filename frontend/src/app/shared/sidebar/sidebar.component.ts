import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() menuItems: MenuItem[] = [];
  @Input() activeTab: string = '';
  @Output() tabSelected = new EventEmitter<string>();
  isCollapsed = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  onItemClick(item: MenuItem, event: Event) {
    event.preventDefault();
    this.tabSelected.emit(item.route);
  }

  getInitials(): string {
    if (!this.currentUser?.fullName) return 'م';
    const names = this.currentUser.fullName.split(' ');
    return names.length >= 2
      ? names[0][0] + names[1][0]
      : names[0][0];
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
