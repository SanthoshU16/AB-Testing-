import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { AuthGuard } from './guards/auth.guard';
import { PhishingLandingComponent } from './pages/phishing-landing/phishing-landing.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },

  // ── Public phishing tracking route (no auth required) ──────────────────
  {
    path: 'track/:campaignId/:employeeId',
    component: PhishingLandingComponent
  },

  // ── Protected Admin routes ─────────────────────────────────────────────
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./shared/layouts/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          )
      },

      // Employees
      {
        path: 'employees',
        loadComponent: () =>
          import('./pages/admin/employees/employee-list/employee-list.component').then(
            (m) => m.EmployeeListComponent
          )
      },

      // Campaigns
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./pages/admin/campaigns/campaign-list/campaign-list.component').then(
            (m) => m.CampaignListComponent
          )
      },
      {
        path: 'campaigns/create',
        loadComponent: () =>
          import('./pages/admin/campaigns/campaign-create/campaign-create.component').then(
            (m) => m.CampaignCreateComponent
          )
      },
      {
        path: 'campaigns/:id',
        loadComponent: () =>
          import('./pages/admin/campaigns/campaign-detail/campaign-detail.component').then(
            (m) => m.CampaignDetailComponent
          )
      },

      // Templates
      {
        path: 'templates',
        loadComponent: () =>
          import('./pages/admin/templates/template-list/template-list.component').then(
            (m) => m.TemplateListComponent
          )
      },
      {
        path: 'templates/new',
        loadComponent: () =>
          import('./pages/admin/templates/template-editor/template-editor.component').then(
            (m) => m.TemplateEditorComponent
          )
      },
      {
        path: 'templates/:id',
        loadComponent: () =>
          import('./pages/admin/templates/template-editor/template-editor.component').then(
            (m) => m.TemplateEditorComponent
          )
      },

      // Analytics
      {
        path: 'analytics',
        loadComponent: () =>
          import('./pages/admin/analytics/analytics.component').then(
            (m) => m.AnalyticsComponent
          )
      },

      // Reports
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/admin/reports/reports.component').then(
            (m) => m.ReportsComponent
          )
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
