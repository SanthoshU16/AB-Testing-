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
    { label: 'Dashboard',  icon: 'bi-grid',                route: '/admin/dashboard',  exact: true  },
    { label: 'Campaigns',  icon: 'bi-envelope-paper',      route: '/admin/campaigns',  exact: false },
    { label: 'Employees',  icon: 'bi-people',              route: '/admin/employees',  exact: false },
    { label: 'Templates',  icon: 'bi-file-earmark-text',   route: '/admin/templates',  exact: false },
    { label: 'Analytics',  icon: 'bi-bar-chart-line',      route: '/admin/analytics',  exact: false },
    { label: 'Reports',    icon: 'bi-file-earmark-pdf',    route: '/admin/reports',    exact: false },
  ];
}
