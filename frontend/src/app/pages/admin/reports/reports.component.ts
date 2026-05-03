import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { EmployeeService } from '../../../services/employee.service';
import { CampaignService } from '../../../services/campaign.service';
import { TrackingService } from '../../../services/tracking.service';
import { ReportService } from '../../../services/report.service';
import { AnalyticsService, DepartmentStat } from '../../../services/analytics.service';
import { Employee } from '../../../models/employee.model';
import { Campaign } from '../../../models/campaign.model';
import { TrackingEvent } from '../../../models/tracking-event.model';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { StatCardComponent } from '../../../components/stat-card/stat-card.component';
import { SafeHtml } from '@angular/platform-browser';

interface StatCardData {
  title: string;
  value: string;
  iconSvg: SafeHtml;
  gradient: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, StatCardComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  employees: Employee[] = [];
  campaigns: Campaign[] = [];
  events: TrackingEvent[] = [];
  /** Deduplicated events for display */
  uniqueEvents: TrackingEvent[] = [];
  deptStats: DepartmentStat[] = [];
  isLoading = true;
  exportingCard: string | null = null;
  safePreviewUrl: SafeResourceUrl | null = null;
  isPreviewOpen: boolean = false;
  stats: StatCardData[] = [];

  constructor(
    private employeeService: EmployeeService,
    private campaignService: CampaignService,
    private trackingService: TrackingService,
    private reportService: ReportService,
    private analyticsService: AnalyticsService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.employeeService.loadEmployees(),
      this.campaignService.loadCampaigns(),
      this.trackingService.loadAllEvents()
    ]);

    combineLatest([
      this.employeeService.employees$,
      this.campaignService.campaigns$,
      this.trackingService.events$
    ]).subscribe(async ([emps, camps, evts]) => {
      this.employees = emps;
      this.campaigns = camps;
      this.events = evts;

      // Deduplicate events by (campaignId, employeeId, eventType)
      const seen = new Set<string>();
      this.uniqueEvents = evts.filter(ev => {
        const key = `${ev.campaignId}-${ev.employeeId}-${ev.eventType}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      this.deptStats = this.analyticsService.getDepartmentStats(emps, evts);

      // Compute stats from deduplicated events
      const delivered = this.uniqueEvents.filter(e => e.eventType === 'email_delivered').length;
      const opened = this.uniqueEvents.filter(e => e.eventType === 'email_opened').length;
      const clicked = this.uniqueEvents.filter(e => e.eventType === 'link_clicked').length;
      const credAttempts = this.uniqueEvents.filter(e => e.eventType === 'credential_attempt').length;
      const clickRate = delivered > 0 ? Math.round((clicked / delivered) * 100) : 0;

      this.stats = [
        {
          title: 'Total Campaigns',
          value: String(camps.length),
          gradient: 'linear-gradient(135deg, #0A84FF 0%, #0066CC 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`)
        },
        {
          title: 'Employees',
          value: String(emps.length),
          gradient: 'linear-gradient(135deg, #5856D6 0%, #4B49C6 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`)
        },
        {
          title: 'Click Rate',
          value: `${clickRate}%`,
          gradient: 'linear-gradient(135deg, #34C759 0%, #28A745 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`)
        },
        {
          title: 'Cred Attempts',
          value: String(credAttempts),
          gradient: 'linear-gradient(135deg, #FF3B30 0%, #D32F2F 100%)',
          iconSvg: this.sanitizer.bypassSecurityTrustHtml(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`)
        }
      ];

      this.isLoading = false;
    });
  }

  // ─── Export Methods ──────────────────────────────────────────────────

  async exportExecutiveSummary(format: 'pdf' | 'csv'): Promise<void> {
    this.exportingCard = `exec-${format}`;
    try {
      if (format === 'pdf') {
        await this.reportService.exportExecutiveSummaryPDF(this.campaigns, this.employees, this.events);
      } else {
        this.reportService.exportExecutiveSummaryCSV(this.campaigns, this.employees, this.events);
      }
    } finally { setTimeout(() => this.exportingCard = null, 1000); }
  }

  async exportCampaignSummary(format: 'pdf' | 'csv'): Promise<void> {
    this.exportingCard = `campaign-${format}`;
    try {
      if (format === 'pdf') {
        await this.reportService.exportCampaignSummaryPDF(this.campaigns, this.events);
      } else {
        this.reportService.exportCampaignSummaryCSV(this.campaigns, this.events);
      }
    } finally { setTimeout(() => this.exportingCard = null, 1000); }
  }

  async exportEmployeeFailure(format: 'pdf' | 'csv'): Promise<void> {
    this.exportingCard = `employee-${format}`;
    try {
      if (format === 'pdf') {
        await this.reportService.exportEmployeeFailurePDF(this.employees, this.events, this.campaigns);
      } else {
        this.reportService.exportEmployeeFailureCSV(this.employees, this.events, this.campaigns);
      }
    } finally { setTimeout(() => this.exportingCard = null, 1000); }
  }

  async exportDepartmentRisk(format: 'pdf' | 'csv'): Promise<void> {
    this.exportingCard = `dept-${format}`;
    try {
      if (format === 'pdf') await this.reportService.exportDepartmentRiskPDF(this.deptStats);
      else this.reportService.exportDepartmentRiskCSV(this.deptStats);
    } finally { setTimeout(() => this.exportingCard = null, 1000); }
  }

  // ─── Preview ────────────────────────────────────────────────────────

  async previewReport(type: 'exec' | 'campaign' | 'employee' | 'department'): Promise<void> {
    let url: string | void = undefined;
    if (type === 'exec') {
      url = await this.reportService.exportExecutiveSummaryPDF(this.campaigns, this.employees, this.events, true);
    } else if (type === 'campaign') {
      url = await this.reportService.exportCampaignSummaryPDF(this.campaigns, this.events, true);
    } else if (type === 'employee') {
      url = await this.reportService.exportEmployeeFailurePDF(this.employees, this.events, this.campaigns, true);
    } else if (type === 'department') {
      url = await this.reportService.exportDepartmentRiskPDF(this.deptStats, true);
    }

    if (url) {
      this.safePreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.isPreviewOpen = true;
    }
  }

  closePreview(): void {
    this.isPreviewOpen = false;
    setTimeout(() => this.safePreviewUrl = null, 300);
  }
}
