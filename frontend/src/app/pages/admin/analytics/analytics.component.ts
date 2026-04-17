import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { EmployeeService } from '../../../services/employee.service';
import { CampaignService } from '../../../services/campaign.service';
import { TrackingService } from '../../../services/tracking.service';
import { AnalyticsService, DepartmentStat, PlatformSummary } from '../../../services/analytics.service';
import { Employee } from '../../../models/employee.model';
import { Campaign } from '../../../models/campaign.model';
import { TrackingEvent } from '../../../models/tracking-event.model';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  @ViewChild('deptChart') deptChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskChart') riskChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;

  summary: PlatformSummary = {
    totalEmployees: 0, activeCampaigns: 0, totalEmailsSent: 0,
    avgClickRate: 0, highRiskCount: 0, mediumRiskCount: 0, lowRiskCount: 0
  };

  deptStats: DepartmentStat[] = [];
  employees: Employee[] = [];
  campaigns: Campaign[] = [];
  events: TrackingEvent[] = [];
  isLoading = true;

  private chartsInitialized = false;
  private deptChartInstance?: Chart;
  private riskChartInstance?: Chart;
  private trendChartInstance?: Chart;

  constructor(
    private employeeService: EmployeeService,
    private campaignService: CampaignService,
    private trackingService: TrackingService,
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
    ]).subscribe(async (results: any[]) => {
      const emps = results[0];
      const camps = results[1];
      const evts = results[2];
      
      this.employees = emps ?? [];
      this.campaigns = camps ?? [];
      this.events = evts ?? [];
      this.summary = await this.analyticsService.getPlatformSummary(this.employees, this.campaigns);
      this.deptStats = this.analyticsService.getDepartmentStats(this.employees, this.events);
      this.isLoading = false;
      if (this.chartsInitialized) this.updateCharts();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
      this.chartsInitialized = true;
    }, 300);
  }

  private initCharts(): void {
    this.initDeptChart();
    this.initRiskChart();
    this.initTrendChart();
  }

  private initDeptChart(): void {
    if (!this.deptChartRef?.nativeElement) return;
    this.deptChartInstance?.destroy();
    this.deptChartInstance = new Chart(this.deptChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.deptStats.map(d => d.department),
        datasets: [{
          label: 'Click Rate %',
          data: this.deptStats.map(d => d.clickRate),
          backgroundColor: 'rgba(10, 132, 255, 0.7)',
          borderColor: '#0a84ff',
          borderWidth: 1, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#86868b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#86868b' }, max: 100 }
        }
      }
    });
  }

  private initRiskChart(): void {
    if (!this.riskChartRef?.nativeElement) return;
    this.riskChartInstance?.destroy();
    const dist = this.analyticsService.getRiskDistribution(this.employees);
    this.riskChartInstance = new Chart(this.riskChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [{
          data: [dist.low, dist.medium, dist.high],
          backgroundColor: ['#34c759', '#ff9500', '#ff3b30'],
          borderWidth: 0, hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#aeaeb2', padding: 16, font: { size: 12 } }
          }
        }
      }
    });
  }

  private initTrendChart(): void {
    if (!this.trendChartRef?.nativeElement) return;
    this.trendChartInstance?.destroy();
    const trend = this.analyticsService.getCampaignTrend(this.campaigns);
    this.trendChartInstance = new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: trend.map((t: any) => t.name),
        datasets: [
          {
            label: 'Emails Sent',
            data: trend.map((t: any) => t.sent),
            borderColor: '#0a84ff', backgroundColor: 'rgba(10,132,255,0.1)',
            tension: 0.4, fill: true, pointRadius: 4
          },
          {
            label: 'Clicked',
            data: trend.map((t: any) => t.clicked),
            borderColor: '#ff3b30', backgroundColor: 'rgba(255,59,48,0.08)',
            tension: 0.4, fill: true, pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#aeaeb2' } } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#86868b' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#86868b' } }
        }
      }
    });
  }

  private updateCharts(): void {
    this.initDeptChart();
    this.initRiskChart();
    this.initTrendChart();
  }
}
