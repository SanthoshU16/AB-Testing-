import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { EmployeeService } from '../../../services/employee.service';
import { CampaignService } from '../../../services/campaign.service';
import { TrackingService } from '../../../services/tracking.service';
import { AnalyticsService, DepartmentStat } from '../../../services/analytics.service';
import { Employee } from '../../../models/employee.model';
import { Campaign } from '../../../models/campaign.model';
import { TrackingEvent } from '../../../models/tracking-event.model';


Chart.register(...registerables);

// ─── Power BI Color Palette ────────────────────────────────────────
const PBI = {
  blue:    '#2563EB',
  teal:    '#0FBED8',
  green:   '#34C759',
  yellow:  '#2563EB',
  orange:  '#FF9500',
  red:     '#FF3B30',
  purple:  '#AF52DE',
  dark:    '#1B2631',
  text:    '#333333',
  muted:   '#666666',
  grid:    'rgba(0,0,0,0.06)',
  bg:      '#F0F2F5',
};

const TOOLTIP_CFG = {
  backgroundColor: 'rgba(27, 38, 49, 0.95)',
  titleFont: { size: 12, weight: 'bold' as const, family: "'Segoe UI', sans-serif" },
  bodyFont: { size: 11, family: "'Segoe UI', sans-serif" },
  padding: 10,
  cornerRadius: 4,
  displayColors: true,
  boxPadding: 4,
  caretSize: 5,
};

interface KpiCard {
  label: string;
  value: string;
  trendText: string;
  trendDir: 'up' | 'down' | 'neutral';
  barPercent: number;
  color: string;
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('deptChart') deptChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('riskChart') riskChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('funnelChart') funnelChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('radarChart') radarChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('stackedChart') stackedChartRef!: ElementRef<HTMLCanvasElement>;

  deptStats: DepartmentStat[] = [];
  employees: Employee[] = [];
  campaigns: Campaign[] = [];
  events: TrackingEvent[] = [];
  kpiCards: KpiCard[] = [];
  lastRefresh = '';
  isLoading = true;

  // Raw unfiltered data
  private allEmployees: Employee[] = [];
  private allCampaigns: Campaign[] = [];
  private allEvents: TrackingEvent[] = [];

  // Filter state
  allDepartments: string[] = [];
  allCampaignNames: string[] = [];
  activeFilterCount = 0;
  private filters: { department: string; campaign: string; risk: string; event: string } = {
    department: 'all', campaign: 'all', risk: 'all', event: 'all'
  };

  private chartsPending = false;
  private chartsRendered = false;
  private charts: Chart[] = [];
  private sub?: Subscription;

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

    this.sub = combineLatest([
      this.employeeService.employees$,
      this.campaignService.campaigns$,
      this.trackingService.events$
    ]).subscribe((results: any[]) => {
      this.allEmployees = results[0] ?? [];
      this.allCampaigns = results[1] ?? [];
      this.allEvents = results[2] ?? [];

      // Build filter options from raw data
      this.allDepartments = [...new Set(this.allEmployees.map(e => e.department).filter(Boolean))];
      this.allCampaignNames = [...new Set(this.allCampaigns.map(c => c.name).filter(Boolean))];

      this.lastRefresh = new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });

      this.applyFilters();
      this.isLoading = false;
      this.chartsPending = true;
      this.chartsRendered = false;
    });
  }

  // ─── Filter Methods ─────────────────────────────────────────────
  onFilterChange(type: string, value: string): void {
    (this.filters as any)[type] = value;
    this.applyFilters();
    // Re-render charts
    this.chartsPending = true;
    this.chartsRendered = false;
  }

  clearFilters(): void {
    this.filters = { department: 'all', campaign: 'all', risk: 'all', event: 'all' };
    this.applyFilters();
    this.chartsPending = true;
    this.chartsRendered = false;
    // Reset selects in the DOM
    document.querySelectorAll<HTMLSelectElement>('.pbi-slicer-select').forEach(s => s.selectedIndex = 0);
  }

  private applyFilters(): void {
    let emps = [...this.allEmployees];
    let camps = [...this.allCampaigns];
    let evts = [...this.allEvents];

    // Department filter
    if (this.filters.department !== 'all') {
      emps = emps.filter(e => e.department === this.filters.department);
      evts = evts.filter(e => e.department === this.filters.department);
    }

    // Campaign filter
    if (this.filters.campaign !== 'all') {
      camps = camps.filter(c => c.name === this.filters.campaign);
      evts = evts.filter(e => e.campaignName === this.filters.campaign);
    }

    // Risk level filter
    if (this.filters.risk !== 'all') {
      if (this.filters.risk === 'high') emps = emps.filter(e => (e.riskScore || 0) >= 70);
      else if (this.filters.risk === 'medium') emps = emps.filter(e => (e.riskScore || 0) >= 30 && (e.riskScore || 0) < 70);
      else emps = emps.filter(e => (e.riskScore || 0) < 30);
    }

    // Event type filter
    if (this.filters.event !== 'all') {
      evts = evts.filter(e => e.eventType === this.filters.event);
    }

    // Count active filters
    this.activeFilterCount = Object.values(this.filters).filter(v => v !== 'all').length;

    // Apply filtered data
    this.employees = emps;
    this.campaigns = camps;
    this.events = evts;
    this.deptStats = this.analyticsService.getDepartmentStats(emps, evts);

    // Rebuild KPIs
    const delivered = this.events.filter(e => e.eventType === 'email_delivered').length;
    const opened = this.events.filter(e => e.eventType === 'email_opened').length;
    const clicked = this.events.filter(e => e.eventType === 'link_clicked').length;
    const creds = this.events.filter(e => e.eventType === 'credential_attempt').length;
    const totalEvents = this.events.length || 1;
    const highRisk = emps.filter(e => (e.riskScore || 0) >= 70).length;
    const avgClickRate = this.deptStats.length > 0
      ? Math.round(this.deptStats.reduce((a, d) => a + d.clickRate, 0) / this.deptStats.length)
      : 0;

    this.kpiCards = [
      {
        label: 'Total Employees',
        value: String(emps.length),
        trendText: camps.length + ' campaigns',
        trendDir: 'neutral',
        barPercent: Math.min(100, emps.length * 5),
        color: PBI.blue,
      },
      {
        label: 'Emails Delivered',
        value: String(delivered),
        trendText: Math.round((delivered / totalEvents) * 100) + '% of events',
        trendDir: 'up',
        barPercent: Math.round((delivered / totalEvents) * 100),
        color: PBI.green,
      },
      {
        label: 'Links Clicked',
        value: String(clicked),
        trendText: Math.round((clicked / totalEvents) * 100) + '% click rate',
        trendDir: clicked > 0 ? 'down' : 'neutral',
        barPercent: Math.round((clicked / totalEvents) * 100),
        color: PBI.blue,
      },
      {
        label: 'Credential Attempts',
        value: String(creds),
        trendText: creds > 0 ? 'Action required' : 'All clear',
        trendDir: creds > 0 ? 'down' : 'up',
        barPercent: Math.round((creds / totalEvents) * 100),
        color: PBI.red,
      },
      {
        label: 'Avg Click Rate',
        value: avgClickRate + '%',
        trendText: avgClickRate > 15 ? 'Above target' : 'Within target',
        trendDir: avgClickRate > 15 ? 'down' : 'up',
        barPercent: avgClickRate,
        color: PBI.purple,
      },
      {
        label: 'High Risk Employees',
        value: String(highRisk),
        trendText: Math.round((highRisk / (emps.length || 1)) * 100) + '% of workforce',
        trendDir: highRisk > 0 ? 'down' : 'up',
        barPercent: Math.round((highRisk / (emps.length || 1)) * 100),
        color: PBI.red,
      }
    ];
  }

  ngAfterViewChecked(): void {
    if (this.chartsPending && !this.chartsRendered && !this.isLoading) {
      if (this.deptChartRef?.nativeElement && this.riskChartRef?.nativeElement
          && this.trendChartRef?.nativeElement && this.funnelChartRef?.nativeElement
          && this.radarChartRef?.nativeElement && this.stackedChartRef?.nativeElement) {
        this.destroyAll();
        this.buildAllCharts();
        this.chartsRendered = true;
        this.chartsPending = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.destroyAll();
  }

  private destroyAll(): void {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  // ─── 1. Department Click Rate Bar ─────────────────────────────────
  private buildAllCharts(): void {
    this.buildDeptChart();
    this.buildRiskChart();
    this.buildTrendChart();
    this.buildFunnelChart();
    this.buildRadarChart();
    this.buildStackedChart();
  }

  private buildDeptChart(): void {
    const canvas = this.deptChartRef.nativeElement;
    this.charts.push(new Chart(canvas, {
      type: 'bar',
      data: {
        labels: this.deptStats.map(d => d.department),
        datasets: [{
          label: 'Click Rate %',
          data: this.deptStats.map(d => d.clickRate),
          backgroundColor: PBI.blue,
          borderWidth: 0,
          borderRadius: 3,
          barPercentage: 0.55,
        }]
      },
        options: {
          responsive: true, maintainAspectRatio: false,
          animation: { duration: 600 },
          onHover: (e: any, el: any) => { e.native.target.style.cursor = el[0] ? 'pointer' : 'default'; },
          onClick: (e: any, activeEls: any, chart: any) => {
            if (activeEls.length > 0) {
              const label = chart.data.labels[activeEls[0].index];
              this.onFilterChange('department', label);
            }
          },
          plugins: { legend: { display: false }, tooltip: TOOLTIP_CFG },
          scales: {
            x: { grid: { display: false }, ticks: { color: PBI.muted, font: { size: 11 } }, border: { display: false } },
            y: { grid: { color: PBI.grid }, ticks: { color: PBI.muted, font: { size: 10 }, callback: (v: any) => v + '%' }, max: 100, border: { display: false } }
          }
        }
    }));
  }

  // ─── 2. Risk Doughnut ─────────────────────────────────────────────
  private buildRiskChart(): void {
    const dist = this.analyticsService.getRiskDistribution(this.employees);
    this.charts.push(new Chart(this.riskChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
          data: [dist.low, dist.medium, dist.high],
          backgroundColor: [PBI.green, PBI.yellow, PBI.red],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6,
        }]
      },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '65%',
          animation: { duration: 800 },
          onHover: (e: any, el: any) => { e.native.target.style.cursor = el[0] ? 'pointer' : 'default'; },
          onClick: (e: any, activeEls: any, chart: any) => {
            if (activeEls.length > 0) {
              const label = chart.data.labels[activeEls[0].index];
              this.onFilterChange('risk', label.toLowerCase());
            }
          },
          plugins: {
            legend: {
              position: 'right',
              labels: { color: PBI.text, font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8, padding: 12 }
            },
            tooltip: TOOLTIP_CFG,
          }
        }
    }));
  }

  // ─── 3. Trend Area Line ───────────────────────────────────────────
  private buildTrendChart(): void {
    const canvas = this.trendChartRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const trend = this.analyticsService.getCampaignTrend(this.campaigns);
    const blueGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    blueGrad.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
    blueGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
    const redGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    redGrad.addColorStop(0, 'rgba(255, 59, 48, 0.2)');
    redGrad.addColorStop(1, 'rgba(255, 59, 48, 0)');

    this.charts.push(new Chart(canvas, {
      type: 'line',
      data: {
        labels: trend.map((t: any) => t.name),
        datasets: [
          {
            label: 'Sent',
            data: trend.map((t: any) => t.sent),
            borderColor: PBI.blue, backgroundColor: blueGrad,
            borderWidth: 2.5, tension: 0.35, fill: true,
            pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: PBI.blue, pointBorderWidth: 2,
          },
          {
            label: 'Clicked',
            data: trend.map((t: any) => t.clicked),
            borderColor: PBI.red, backgroundColor: redGrad,
            borderWidth: 2.5, tension: 0.35, fill: true,
            pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: PBI.red, pointBorderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 800 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: PBI.text, font: { size: 11 }, usePointStyle: true, padding: 16 } },
          tooltip: { ...TOOLTIP_CFG, mode: 'index' as const, intersect: false },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: PBI.muted, font: { size: 10 } }, border: { display: false } },
          y: { grid: { color: PBI.grid }, ticks: { color: PBI.muted, font: { size: 10 } }, beginAtZero: true, border: { display: false } }
        }
      }
    }));
  }

  // ─── 4. Event Funnel (Horizontal Bar) ─────────────────────────────
  private buildFunnelChart(): void {
    const delivered = this.events.filter(e => e.eventType === 'email_delivered').length;
    const opened = this.events.filter(e => e.eventType === 'email_opened').length;
    const clicked = this.events.filter(e => e.eventType === 'link_clicked').length;
    const creds = this.events.filter(e => e.eventType === 'credential_attempt').length;

    this.charts.push(new Chart(this.funnelChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Delivered', 'Opened', 'Clicked', 'Credentials'],
        datasets: [{
          data: [delivered, opened, clicked, creds],
          backgroundColor: [PBI.blue, PBI.teal, PBI.orange, PBI.red],
          borderWidth: 0,
          borderRadius: 3,
          barPercentage: 0.6,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 700 },
        onHover: (e: any, el: any) => { e.native.target.style.cursor = el[0] ? 'pointer' : 'default'; },
        onClick: (e: any, activeEls: any, chart: any) => {
          if (activeEls.length > 0) {
            const labelsMap: any = { 'Delivered': 'email_delivered', 'Opened': 'email_opened', 'Clicked': 'link_clicked', 'Credentials': 'credential_attempt' };
            const label = chart.data.labels[activeEls[0].index];
            this.onFilterChange('event', labelsMap[label]);
          }
        },
        plugins: { legend: { display: false }, tooltip: TOOLTIP_CFG },
        scales: {
          x: { grid: { color: PBI.grid }, ticks: { color: PBI.muted, font: { size: 10 } }, border: { display: false } },
          y: { grid: { display: false }, ticks: { color: PBI.text, font: { size: 11, weight: 'bold' as const } }, border: { display: false } }
        }
      }
    }));
  }

  // ─── 5. Department Risk Radar ─────────────────────────────────────
  private buildRadarChart(): void {
    this.charts.push(new Chart(this.radarChartRef.nativeElement, {
      type: 'radar',
      data: {
        labels: this.deptStats.map(d => d.department),
        datasets: [
          {
            label: 'Click Rate',
            data: this.deptStats.map(d => d.clickRate),
            borderColor: PBI.blue, backgroundColor: 'rgba(37, 99, 235, 0.12)',
            borderWidth: 2, pointRadius: 3, pointBackgroundColor: PBI.blue,
          },
          {
            label: 'Risk Score',
            data: this.deptStats.map(d => d.avgRiskScore),
            borderColor: PBI.red, backgroundColor: 'rgba(255, 59, 48, 0.08)',
            borderWidth: 2, pointRadius: 3, pointBackgroundColor: PBI.red,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 800 },
        scales: {
          r: {
            grid: { color: PBI.grid }, angleLines: { color: PBI.grid },
            pointLabels: { color: PBI.text, font: { size: 10 } },
            ticks: { display: false }, suggestedMax: 100,
          }
        },
        plugins: {
          legend: { position: 'bottom', labels: { color: PBI.text, font: { size: 10 }, usePointStyle: true, padding: 12 } },
          tooltip: TOOLTIP_CFG,
        }
      }
    }));
  }

  // ─── 6. Stacked Department Threats ────────────────────────────────
  private buildStackedChart(): void {
    this.charts.push(new Chart(this.stackedChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.deptStats.map(d => d.department),
        datasets: [
          {
            label: 'Clicked',
            data: this.deptStats.map(d => d.clicked),
            backgroundColor: PBI.orange,
            borderWidth: 0, borderRadius: 2,
          },
          {
            label: 'Credentials',
            data: this.deptStats.map(d => d.credentialAttempts),
            backgroundColor: PBI.red,
            borderWidth: 0, borderRadius: 2,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 700 },
        plugins: {
          legend: { labels: { color: PBI.text, font: { size: 10 }, usePointStyle: true, padding: 12 } },
          tooltip: TOOLTIP_CFG,
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: PBI.muted, font: { size: 10 } }, border: { display: false } },
          y: { stacked: true, grid: { color: PBI.grid }, ticks: { color: PBI.muted, font: { size: 10 }, stepSize: 1 }, beginAtZero: true, border: { display: false } }
        }
      }
    }));
  }
}
