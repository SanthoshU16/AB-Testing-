import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { EmployeeService } from '../../../services/employee.service';
import { CampaignService } from '../../../services/campaign.service';
import { TrackingService } from '../../../services/tracking.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { UserProfile } from '../../../models/user.model';
import { StatCardComponent } from '../../../components/stat-card/stat-card.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface StatCardData {
  title: string;
  value: string;
  iconSvg: SafeHtml;
  gradient: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  userProfile: UserProfile | null = null;
  currentTime = '';
  greeting = '';
  stats: StatCardData[] = [];
  private sub?: Subscription;

  constructor(
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private employeeService: EmployeeService,
    private campaignService: CampaignService,
    private trackingService: TrackingService,
    private analyticsService: AnalyticsService
  ) {}

  async ngOnInit(): Promise<void> {
    this.authService.userProfile$.subscribe(profile => {
      this.userProfile = profile;
    });

    this.updateGreeting();
    setInterval(() => this.updateGreeting(), 60000);

    // Load all live data
    await Promise.all([
      this.employeeService.loadEmployees(),
      this.campaignService.loadCampaigns(),
      this.trackingService.loadAllEvents()
    ]);

    this.sub = combineLatest([
      this.employeeService.employees$,
      this.campaignService.campaigns$,
      this.trackingService.events$
    ]).subscribe(async ([emps, camps, evts]) => {
      const summary = await this.analyticsService.getPlatformSummary(emps, camps);
      this.stats = [
        {
          title: 'Total Employees',
          value: String(summary.totalEmployees),
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`)
        },
        {
          title: 'Active Campaigns',
          value: String(summary.activeCampaigns),
          gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`)
        },
        {
          title: 'Avg Click Rate',
          value: `${summary.avgClickRate}%`,
          gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`)
        },
        {
          title: 'High Risk Employees',
          value: String(summary.highRiskCount),
          gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`)
        }
      ];
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  private updateGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';

    this.currentTime = new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
