import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { CredCountPipe } from '../../../shared/pipes/cred-count.pipe';
import { EmployeeService } from '../../../services/employee.service';
import { CampaignService } from '../../../services/campaign.service';
import { TrackingService } from '../../../services/tracking.service';
import { ReportService } from '../../../services/report.service';
import { AnalyticsService, DepartmentStat } from '../../../services/analytics.service';
import { Employee } from '../../../models/employee.model';
import { Campaign } from '../../../models/campaign.model';
import { TrackingEvent } from '../../../models/tracking-event.model';

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  formats: string[];
  action: () => void;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, CredCountPipe],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  employees: Employee[] = [];
  campaigns: Campaign[] = [];
  events: TrackingEvent[] = [];
  deptStats: DepartmentStat[] = [];
  isLoading = true;
  exportingCard: string | null = null;

  reportCards: ReportCard[] = [];

  constructor(
    private employeeService: EmployeeService,
    private campaignService: CampaignService,
    private trackingService: TrackingService,
    private reportService: ReportService,
    private analyticsService: AnalyticsService
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
    ]).subscribe(([emps, camps, evts]) => {
      this.employees = emps;
      this.campaigns = camps;
      this.events = evts;
      this.deptStats = this.analyticsService.getDepartmentStats(emps, evts);
      this.isLoading = false;
      this.buildReportCards();
    });
  }

  private buildReportCards(): void {
    this.reportCards = [
      {
        title: 'Campaign Summary Report',
        description: 'Overview of all campaigns including send counts, click rates, and credential attempts.',
        icon: '📊',
        formats: ['PDF', 'CSV'],
        action: () => this.exportCampaignSummary
      },
      {
        title: 'Employee Failure Report',
        description: 'List of employees who clicked phishing links or submitted credentials.',
        icon: '👤',
        formats: ['PDF', 'CSV'],
        action: () => this.exportEmployeeFailure
      },
      {
        title: 'Department Risk Report',
        description: 'Aggregated risk scores and click rates grouped by department.',
        icon: '🏢',
        formats: ['PDF', 'CSV'],
        action: () => this.exportDepartmentRisk
      }
    ];
  }

  async exportCampaignSummary(format: 'pdf' | 'csv'): Promise<void> {
    this.exportingCard = `campaign-${format}`;
    try {
      if (format === 'pdf') await this.reportService.exportCampaignSummaryPDF(this.campaigns);
      else this.reportService.exportCampaignSummaryCSV(this.campaigns);
    } finally { setTimeout(() => this.exportingCard = null, 1000); }
  }

  async exportEmployeeFailure(format: 'pdf' | 'csv'): Promise<void> {
    this.exportingCard = `employee-${format}`;
    try {
      if (format === 'pdf') await this.reportService.exportEmployeeFailurePDF(this.employees, this.events);
      else this.reportService.exportEmployeeFailureCSV(this.employees, this.events);
    } finally { setTimeout(() => this.exportingCard = null, 1000); }
  }

  async exportDepartmentRisk(format: 'pdf' | 'csv'): Promise<void> {
    this.exportingCard = `dept-${format}`;
    try {
      if (format === 'pdf') await this.reportService.exportDepartmentRiskPDF(this.deptStats);
      else this.reportService.exportDepartmentRiskCSV(this.deptStats);
    } finally { setTimeout(() => this.exportingCard = null, 1000); }
  }
}
