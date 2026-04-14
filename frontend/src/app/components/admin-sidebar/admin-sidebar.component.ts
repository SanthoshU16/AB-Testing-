import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  navItems = [
    { label: 'Dashboard', icon: 'bi-grid', route: '/admin/dashboard' },
    { label: 'Campaigns', icon: 'bi-envelope', route: '/admin/campaigns' },
    { label: 'Employees', icon: 'bi-people', route: '/admin/employees' },
    { label: 'Templates', icon: 'bi-file-earmark-text', route: '/admin/templates' },
    { label: 'Analytics', icon: 'bi-bar-chart', route: '/admin/analytics' },
    { label: 'Reports', icon: 'bi-file-earmark-pdf', route: '/admin/reports' },
  ];
}
