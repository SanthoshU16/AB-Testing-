import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../models/user.model';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css'],
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class AdminSidebarComponent implements OnInit {
  @Input() collapsed = false;
  @Output() toggle = new EventEmitter<void>();

  userProfile: UserProfile | null = null;
  userMenuOpen = false;

  navItems = [
    { label: 'Dashboard', icon: 'bi-grid-1x2-fill', route: '/admin/dashboard', exact: true },
    { label: 'Campaigns', icon: 'bi-send-fill', route: '/admin/campaigns', exact: false },
    { label: 'Employees', icon: 'bi-people-fill', route: '/admin/employees', exact: false },
    { label: 'Templates', icon: 'bi-file-earmark-richtext-fill', route: '/admin/templates', exact: false },
    { label: 'Analytics', icon: 'bi-graph-up', route: '/admin/analytics', exact: false },
    { label: 'Reports', icon: 'bi-clipboard2-data-fill', route: '/admin/reports', exact: false },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.authService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });
  }

  toggleSidebar(): void {
    this.toggle.emit();
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  navigateAndClose(route: string): void {
    this.closeUserMenu();
    this.router.navigate([route]);
  }

  goBack(): void {
    this.router.navigate(['/intro']);
  }

  logout(): void {
    this.userMenuOpen = false;
    this.authService.signOut().then(() => {
      this.router.navigate(['/sign-in']);
    });
  }

  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-card-wrapper')) {
      this.userMenuOpen = false;
    }
  }
}
