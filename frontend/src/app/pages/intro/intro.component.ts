import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription, combineLatest } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { EmployeeService } from '../../services/employee.service';
import { CampaignService } from '../../services/campaign.service';
import { TrackingService } from '../../services/tracking.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css']
})
export class IntroComponent implements OnInit, AfterViewInit, OnDestroy {
  userName = 'User';
  userEmail = '';
  userInitials = 'U';
  userRole = 'viewer';
  greeting = 'Hello';
  isSidebarHidden = typeof window !== 'undefined' ? window.innerWidth <= 1024 : false;
  
  // Real stats
  activeCampaignsCount = 0;
  phishPronePercentage = '0%';
  securityScore = '0%';
  totalEmployees = 0;
  failedTestCount = 0;
  
  private sub?: Subscription;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private employeeService: EmployeeService,
    private campaignService: CampaignService,
    private trackingService: TrackingService,
    private analyticsService: AnalyticsService
  ) {}

  async ngOnInit(): Promise<void> {
    const profile = this.authService.currentProfile;
    if (profile) {
      this.userName = profile.firstName || 'User';
      this.userEmail = profile.email || '';
      this.userInitials = profile.firstName ? profile.firstName.charAt(0).toUpperCase() : 'U';
      this.userRole = profile.role || 'viewer';
    }
    this.updateGreeting();

    // Load live data
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
      this.totalEmployees = emps.length;
      const summary = await this.analyticsService.getPlatformSummary(emps, camps);
      this.activeCampaignsCount = summary.activeCampaigns;
      this.phishPronePercentage = `${summary.avgClickRate}%`;
      // High risk count used for failed tests indicator
      this.failedTestCount = summary.highRiskCount;
      // Security Score can be inversely proportional to risk (just an example calculation)
      const avgRisk = emps.reduce((acc, emp) => acc + (emp.riskScore || 0), 0) / (emps.length || 1);
      this.securityScore = `${Math.round(100 - avgRisk)}%`;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private updateGreeting(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.setupLiquidButtons(), 150);
  }

  logout(): void {
    this.authService.signOut();
  }

  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;
  }

  goIn(path: string = '/admin/dashboard'): void {
    this.router.navigate([path]);
  }

  private setupLiquidButtons(): void {
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('.liquid-btn'));
    buttons.forEach(button => {
      if (button.dataset['liquidBound'] === 'true') return;
      button.dataset['liquidBound'] = 'true';

      let rect: DOMRect | null = null;
      let rafId = 0;
      let lastX = 0;
      let lastY = 0;

      const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max);

      const update = () => {
        rafId = 0;
        if (!rect) return;
        const x = clamp(lastX - rect.left, 0, rect.width);
        const y = clamp(lastY - rect.top, 0, rect.height);
        const percentX = rect.width ? x / rect.width : 0.5;
        const percentY = rect.height ? y / rect.height : 0.5;

        const tiltX = (0.5 - percentY) * 12;
        const tiltY = (percentX - 0.5) * 14;

        button.style.setProperty('--tilt-x', `${tiltX.toFixed(2)}deg`);
        button.style.setProperty('--tilt-y', `${tiltY.toFixed(2)}deg`);
        button.style.setProperty('--shine-x', `${(percentX * 100).toFixed(1)}%`);
        button.style.setProperty('--shine-y', `${(percentY * 100).toFixed(1)}%`);
        button.style.setProperty('--shade-x', `${((1 - percentX) * 100).toFixed(1)}%`);
        button.style.setProperty('--shade-y', `${((1 - percentY) * 100).toFixed(1)}%`);
      };

      const scheduleUpdate = () => {
        if (rafId) return;
        rafId = requestAnimationFrame(update);
      };

      const reset = () => {
        rect = null;
        button.classList.remove('is-hovered');
        button.style.removeProperty('--tilt-x');
        button.style.removeProperty('--tilt-y');
        button.style.removeProperty('--shine-x');
        button.style.removeProperty('--shine-y');
        button.style.removeProperty('--shade-x');
        button.style.removeProperty('--shade-y');
      };

      button.addEventListener('pointerenter', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        rect = button.getBoundingClientRect();
        button.classList.add('is-hovered');
      });

      button.addEventListener('pointermove', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        if (!rect) rect = button.getBoundingClientRect();
        lastX = event.clientX;
        lastY = event.clientY;
        scheduleUpdate();
      });

      button.addEventListener('pointerleave', (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        reset();
      });
    });
  }
}
