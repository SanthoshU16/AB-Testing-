import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CampaignService } from '../../../../services/campaign.service';
import { TrackingService } from '../../../../services/tracking.service';
import { EmployeeService } from '../../../../services/employee.service';
import { Campaign } from '../../../../models/campaign.model';
import { TrackingEvent } from '../../../../models/tracking-event.model';
import { Employee } from '../../../../models/employee.model';

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.css']
})
export class CampaignDetailComponent implements OnInit {
  campaign: Campaign | null = null;
  events: TrackingEvent[] = [];
  employees: Employee[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private campaignService: CampaignService,
    private trackingService: TrackingService,
    private employeeService: EmployeeService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/admin/campaigns']); return; }

    await this.employeeService.loadEmployees();
    this.employeeService.employees$.subscribe(e => this.employees = e);

    this.campaign = await this.campaignService.getCampaign(id);
    this.events = await this.trackingService.loadEventsByCampaign(id);
    this.isLoading = false;
  }

  getEmployeeName(id: string): string {
    const emp = this.employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : id;
  }

  getEmployeeDept(id: string): string {
    return this.employees.find(e => e.id === id)?.department ?? '—';
  }

  getClickRate(): number {
    const sent = this.campaign?.stats?.totalSent ?? 0;
    const clicked = this.campaign?.stats?.clicked ?? 0;
    return sent > 0 ? Math.round((clicked / sent) * 100) : 0;
  }

  getEventLabel(type: string): string {
    const map: Record<string, string> = {
      email_delivered: '📨 Email Delivered',
      email_opened: '👁️ Email Opened',
      link_clicked: '🔗 Link Clicked',
      credential_attempt: '⚠️ Credential Attempt'
    };
    return map[type] ?? type;
  }

  getEventClass(type: string): string {
    const map: Record<string, string> = {
      email_delivered: 'ev-delivered',
      email_opened: 'ev-opened',
      link_clicked: 'ev-clicked',
      credential_attempt: 'ev-cred'
    };
    return map[type] ?? '';
  }

  async markCompleted(): Promise<void> {
    if (!this.campaign?.id) return;
    await this.campaignService.updateCampaign(this.campaign.id, { status: 'completed' });
    this.campaign = await this.campaignService.getCampaign(this.campaign.id);
  }

  goBack(): void { this.router.navigate(['/admin/campaigns']); }
}
