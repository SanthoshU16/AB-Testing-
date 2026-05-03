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

interface ActivityItem {
  type: 'success' | 'danger' | 'info' | 'warning';
  title: string;
  meta: string;
  time: number;
  badgeText: string;
  campaignId?: string;
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
  recentActivities: ActivityItem[] = [];
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
      const summary = this.analyticsService.getPlatformSummary(emps, camps, evts);
      this.stats = [
        {
          title: 'Total Employees',
          value: String(summary.totalEmployees),
          gradient: 'linear-gradient(135deg, #5E5CE6 0%, #4F46E5 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`)
        },
        {
          title: 'Active Campaigns',
          value: String(summary.activeCampaigns),
          gradient: 'linear-gradient(135deg, #41A4FF 0%, #007AFF 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`)
        },
        {
          title: 'Avg Click Rate',
          value: `${summary.avgClickRate}%`,
          gradient: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`)
        },
        {
          title: 'High Risk Employees',
          value: String(summary.highRiskCount),
          gradient: 'linear-gradient(135deg, #FF3B30 0%, #D32F2F 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`)
        }
      ];

      // Map Tracking Events to Recent Activities
      const activities: ActivityItem[] = evts.map(evt => {
        let type: ActivityItem['type'] = 'info';
        let title = '';
        let badgeText = '';

        switch (evt.eventType) {
          case 'email_delivered':
            type = 'success';
            title = 'Phishing Simulation Delivered';
            badgeText = 'Delivered';
            break;
          case 'email_opened':
            type = 'info';
            title = 'Email Opened';
            badgeText = 'Opened';
            break;
          case 'link_clicked':
            type = 'warning';
            title = 'Link Clicked Warning';
            badgeText = 'Clicked';
            break;
          case 'credential_attempt':
            type = 'danger';
            title = 'Credential Compromise';
            badgeText = 'Compromised';
            break;
        }

        const campaign = camps.find((c: any) => c.id === evt.campaignId);
        const campaignName = campaign?.name || evt.campaignName || 'Unknown Campaign';

        const employee = emps.find((e: any) => e.id === evt.employeeId);
        const employeeEmail = employee?.email || evt.employeeEmail || 'Unknown';

        return {
          type,
          title,
          meta: `${employeeEmail} · ${campaignName}`,
          time: evt.timestamp,
          badgeText,
          campaignId: evt.campaignId
        };
      });

      // Sort by time descending and take top 5
      this.recentActivities = activities.sort((a, b) => b.time - a.time).slice(0, 5);
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
