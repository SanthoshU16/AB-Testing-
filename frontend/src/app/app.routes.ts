import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { AuthGuard } from './guards/auth.guard';
import { PhishingLandingComponent } from './pages/phishing-landing/phishing-landing.component';
import { AboutComponent } from './pages/about/about.component';
import { BlogComponent } from './pages/blog/blog.component';
import { CareerComponent } from './pages/career/career.component';
import { ContactComponent } from './pages/contact/contact.component';
import { TermsComponent } from './pages/terms/terms.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { PricingComponent } from './pages/pricing/pricing.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'sign-in', component: SignInComponent },
  { path: 'sign-up', component: SignUpComponent },

  { path: 'about', component: AboutComponent },

  { path: 'blog', component: BlogComponent },

  { path: 'career', component: CareerComponent },

  { path: 'contact', component: ContactComponent },

  { path: 'terms', component: TermsComponent },

  { path: 'privacy', component: PrivacyComponent },

  { path: 'pricing', component: PricingComponent },

  // ── Public phishing tracking route (no auth required) ──────────────────
  {
    path: 'track/:campaignId/:employeeId',
    component: PhishingLandingComponent
  },

  // ── Protected Intro Route ──────────────────────────────────────────────
  {
    path: 'intro',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/intro/intro.component').then((m) => m.IntroComponent)
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
      },

      // Notifications
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/admin/notifications/notifications.component').then(
            (m) => m.NotificationsComponent
          )
      },

      // User Menu Pages
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/admin/profile/profile.component').then(
            (m) => m.ProfileComponent
          )
      },
      {
        path: 'personalization',
        loadComponent: () =>
          import('./pages/admin/personalization/personalization.component').then(
            (m) => m.PersonalizationComponent
          )
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin/settings/settings.component').then(
            (m) => m.SettingsComponent
          )
      },
      {
        path: 'upgrade-plan',
        loadComponent: () =>
          import('./pages/admin/upgrade-plan/upgrade-plan.component').then(
            (m) => m.UpgradePlanComponent
          )
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
