import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Employee } from '../models/employee.model';
import { Campaign } from '../models/campaign.model';
import { TrackingEvent } from '../models/tracking-event.model';

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
  private apiUrl = 'http://localhost:8080/api/analytics';

  constructor(private http: HttpClient) {}

  async getPlatformSummary(employees: Employee[], campaigns: Campaign[]): Promise<PlatformSummary> {
    // We can now call the backend instead of calculating here
    try {
      return await firstValueFrom(this.http.get<PlatformSummary>(`${this.apiUrl}/summary`));
    } catch (e) {
      console.warn('Falling back to local calculation');
      return this.calculateLocalSummary(employees, campaigns);
    }
  }

  private calculateLocalSummary(employees: Employee[], campaigns: Campaign[]): PlatformSummary {
    return {
      totalEmployees: employees.length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalEmailsSent: campaigns.reduce((acc, c) => acc + (c.stats?.totalSent || 0), 0),
      avgClickRate: this.calculateAvgClickRate(campaigns),
      highRiskCount: employees.filter(e => (e.riskScore || 0) >= 70).length
    };
  }

  private calculateAvgClickRate(campaigns: Campaign[]): number {
    const activeWithStats = campaigns.filter(c => (c.stats?.totalSent || 0) > 0);
    if (activeWithStats.length === 0) return 0;
    const totalRate = activeWithStats.reduce((acc, c) => {
      const rate = ((c.stats?.clicked || 0) / (c.stats?.totalSent || 1)) * 100;
      return acc + rate;
    }, 0);
    return Math.round(totalRate / activeWithStats.length);
  }

  // Other methods (dept stats, etc.) can stay local for UI reactivity 
  // or be moved to backend if needed for consistency.
  getDepartmentStats(employees: Employee[], events: TrackingEvent[]): any[] {
    const depts = [...new Set(employees.map(e => e.department))];
    return depts.map(dept => {
      const deptEmps = employees.filter(e => e.department === dept);
      const deptEvents = events.filter(ev => ev.department === dept);
      const clicked = deptEvents.filter(ev => ev.eventType === 'link_clicked').length;
      const creds = deptEvents.filter(ev => ev.eventType === 'credential_attempt').length;
      return {
        department: dept,
        totalCount: deptEmps.length,
        clicked,
        credentialAttempts: creds,
        clickRate: deptEmps.length > 0 ? Math.round((clicked / deptEmps.length) * 100) : 0,
        avgRiskScore: deptEmps.length > 0 ? Math.round(deptEmps.reduce((acc, e) => acc + (e.riskScore || 0), 0) / deptEmps.length) : 0
      };
    });
  }

  getRiskDistribution(employees: Employee[]): { low: number, medium: number, high: number } {
    return {
      low: employees.filter(e => (e.riskScore || 0) < 30).length,
      medium: employees.filter(e => (e.riskScore || 0) >= 30 && (e.riskScore || 0) < 70).length,
      high: employees.filter(e => (e.riskScore || 0) >= 70).length
    };
  }

  getCampaignTrend(campaigns: Campaign[]): any[] {
    return campaigns
      .sort((a, b) => ((a.createdAt as any) || 0) - ((b.createdAt as any) || 0))
      .slice(-6)
      .map(c => ({
        name: c.name,
        sent: c.stats?.totalSent || 0,
        clicked: c.stats?.clicked || 0
      }));
  }
}
