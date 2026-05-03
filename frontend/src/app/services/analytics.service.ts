import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Employee } from '../models/employee.model';
import { Campaign } from '../models/campaign.model';
import { TrackingEvent } from '../models/tracking-event.model';
import { environment } from '../../environments/environment';

export interface DepartmentStat {
  department: string;
  totalCount: number;
  clicked: number;
  credentialAttempts: number;
  clickRate: number;
  avgRiskScore: number;
}

export interface PlatformSummary {
  totalEmployees: number;
  activeCampaigns: number;
  totalEmailsSent: number;
  avgClickRate: number;
  highRiskCount: number;
  mediumRiskCount?: number;
  lowRiskCount?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  // Calculate dynamic risk score for an employee based on their events
  private getEmployeeRiskScore(employee: Employee, events: TrackingEvent[]): number {
    const empEvents = events.filter(ev => ev.employeeId === employee.id || (employee.email && ev.employeeEmail === employee.email));
    
    // Deduplicate event types per campaign to avoid inflating risk score from multiple clicks
    const uniqueClickedCampaigns = new Set(empEvents.filter(ev => ev.eventType === 'link_clicked').map(ev => ev.campaignId));
    const uniqueCredCampaigns = new Set(empEvents.filter(ev => ev.eventType === 'credential_attempt').map(ev => ev.campaignId));
    
    let score = employee.riskScore || 0;
    score += uniqueClickedCampaigns.size * 30;
    score += uniqueCredCampaigns.size * 50;
    
    return Math.min(score, 100);
  }

  getPlatformSummary(employees: Employee[], campaigns: Campaign[], events: TrackingEvent[]): PlatformSummary {
    // Unique counts per employee per campaign
    const uniqueEvents = this.getUniqueEventTuples(events);
    const deliveredCount = uniqueEvents.filter(e => e.eventType === 'email_delivered').length;
    const clickedCount = uniqueEvents.filter(e => e.eventType === 'link_clicked').length;
    const avgClickRate = deliveredCount > 0 ? Math.round((clickedCount / deliveredCount) * 100) : 0;

    let highRiskCount = 0;
    employees.forEach(e => {
      const risk = this.getEmployeeRiskScore(e, events);
      if (risk >= 70) highRiskCount++;
    });

    return {
      totalEmployees: employees.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalEmailsSent: deliveredCount,
      avgClickRate: avgClickRate,
      highRiskCount: highRiskCount
    };
  }

  // Helper to get unique (campaignId, employeeId, eventType) tuples
  private getUniqueEventTuples(events: TrackingEvent[]): TrackingEvent[] {
    const seen = new Set<string>();
    return events.filter(ev => {
      const key = `${ev.campaignId}-${ev.employeeId}-${ev.eventType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  getDepartmentStats(employees: Employee[], events: TrackingEvent[]): any[] {
    const depts = [...new Set(employees.map(e => e.department).filter(Boolean))];
    const uniqueEvents = this.getUniqueEventTuples(events);

    return depts.map(dept => {
      const deptEmps = employees.filter(e => e.department === dept);
      const deptEmails = new Set(deptEmps.map(e => e.email));
      const deptIds = new Set(deptEmps.map(e => e.id));
      
      const deptEvents = uniqueEvents.filter(ev => 
        ev.department === dept || 
        (ev.employeeEmail && deptEmails.has(ev.employeeEmail)) ||
        (ev.employeeId && deptIds.has(ev.employeeId))
      );
      
      const delivered = deptEvents.filter(ev => ev.eventType === 'email_delivered').length;
      const clicked = deptEvents.filter(ev => ev.eventType === 'link_clicked').length;
      const creds = deptEvents.filter(ev => ev.eventType === 'credential_attempt').length;
      
      const rateDenominator = delivered > 0 ? delivered : (deptEmps.length > 0 ? deptEmps.length : 1);
      
      let totalRisk = 0;
      deptEmps.forEach(e => {
        totalRisk += this.getEmployeeRiskScore(e, events);
      });
      
      return {
        department: dept,
        totalCount: deptEmps.length,
        clicked,
        credentialAttempts: creds,
        clickRate: Math.min(100, Math.round((clicked / rateDenominator) * 100)),
        avgRiskScore: deptEmps.length > 0 ? Math.round(totalRisk / deptEmps.length) : 0
      };
    });
  }

  getRiskDistribution(employees: Employee[], events: TrackingEvent[]): { low: number, medium: number, high: number } {
    let low = 0, medium = 0, high = 0;
    employees.forEach(e => {
      const risk = this.getEmployeeRiskScore(e, events);
      if (risk < 30) low++;
      else if (risk < 70) medium++;
      else high++;
    });
    return { low, medium, high };
  }

  getCampaignTrend(campaigns: Campaign[], events: TrackingEvent[]): any[] {
    const uniqueEvents = this.getUniqueEventTuples(events);
    return campaigns
      .sort((a, b) => ((a.createdAt as any) || 0) - ((b.createdAt as any) || 0))
      .slice(-6)
      .map(c => {
        const campEvents = uniqueEvents.filter(e => e.campaignId === c.id);
        const sent = campEvents.filter(e => e.eventType === 'email_delivered').length;
        const clicked = campEvents.filter(e => e.eventType === 'link_clicked').length;
        return {
          name: c.name,
          sent: sent,
          clicked: clicked
        };
      });
  }
}
