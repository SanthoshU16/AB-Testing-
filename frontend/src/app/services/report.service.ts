import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import { Campaign } from '../models/campaign.model';
import { TrackingEvent } from '../models/tracking-event.model';
import { DepartmentStat } from './analytics.service';

interface UniqueEventSummary {
  delivered: number;
  opened: number;
  clicked: number;
  credentialAttempts: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {

  // ─── Helpers ────────────────────────────────────────────────────────

  private deduplicateEvents(events: TrackingEvent[]): TrackingEvent[] {
    const seen = new Set<string>();
    return events.filter(ev => {
      const key = `${ev.campaignId}-${ev.employeeId}-${ev.eventType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private summariseEvents(events: TrackingEvent[]): UniqueEventSummary {
    const unique = this.deduplicateEvents(events);
    return {
      delivered: unique.filter(e => e.eventType === 'email_delivered').length,
      opened: unique.filter(e => e.eventType === 'email_opened').length,
      clicked: unique.filter(e => e.eventType === 'link_clicked').length,
      credentialAttempts: unique.filter(e => e.eventType === 'credential_attempt').length,
    };
  }

  private computeRiskScore(employee: Employee, events: TrackingEvent[]): number {
    const empEvents = events.filter(ev =>
      ev.employeeId === employee.id || (employee.email && ev.employeeEmail === employee.email)
    );
    const uniqueClicked = new Set(empEvents.filter(e => e.eventType === 'link_clicked').map(e => e.campaignId));
    const uniqueCreds = new Set(empEvents.filter(e => e.eventType === 'credential_attempt').map(e => e.campaignId));
    const score = (employee.riskScore || 0) + (uniqueClicked.size * 30) + (uniqueCreds.size * 50);
    return Math.min(score, 100);
  }

  private dateStr(): string {
    return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ─── PDF Drawing Helpers ─────────────────────────────────────────────

  private drawHeader(doc: any, title: string, subtitle: string): number {
    // Dark banner
    doc.setFillColor(10, 37, 64);
    doc.rect(0, 0, doc.internal.pageSize.width, 42, 'F');
    // Accent line
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 42, doc.internal.pageSize.width, 2, 'F');

    // Title
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 14, 20);
    // Subtitle
    doc.setFontSize(9);
    doc.setTextColor(180, 200, 220);
    doc.text(subtitle, 14, 28);
    // Brand + date
    doc.setFontSize(8);
    doc.text(`Armor Bridge  •  ${this.dateStr()}`, 14, 36);
    // Logo text right
    doc.setFontSize(10);
    doc.setTextColor(37, 99, 235);
    doc.text('ARMOR BRIDGE', doc.internal.pageSize.width - 14, 20, { align: 'right' });
    doc.setFontSize(7);
    doc.setTextColor(180, 200, 220);
    doc.text('Phishing Simulation Platform', doc.internal.pageSize.width - 14, 28, { align: 'right' });

    return 52; // next Y position
  }

  private drawKpiCard(doc: any, x: number, y: number, w: number, label: string, value: string, color: number[]): void {
    // Card background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, w, 28, 3, 3, 'F');
    // Color accent bar
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(x, y, 3, 28, 'F');
    // Value
    doc.setFontSize(18);
    doc.setTextColor(10, 37, 64);
    doc.text(value, x + 10, y + 14);
    // Label
    doc.setFontSize(8);
    doc.setTextColor(100, 115, 130);
    doc.text(label, x + 10, y + 22);
  }

  private drawSectionTitle(doc: any, y: number, title: string, color: number[] = [37, 99, 235]): number {
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(14, y, 4, 12, 'F');
    doc.setFontSize(13);
    doc.setTextColor(10, 37, 64);
    doc.text(title, 22, y + 9);
    return y + 18;
  }

  private drawFooter(doc: any): void {
    const pageCount = doc.internal.getNumberOfPages();
    const pw = doc.internal.pageSize.width;
    const ph = doc.internal.pageSize.height;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(248, 250, 252);
      doc.rect(0, ph - 14, pw, 14, 'F');
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text('Confidential — Armor Bridge Phishing Simulation Report', 14, ph - 5);
      doc.text(`Page ${i} of ${pageCount}`, pw - 14, ph - 5, { align: 'right' });
    }
  }

  // ─── CSV Export ────────────────────────────────────────────────────────

  exportExecutiveSummaryCSV(campaigns: Campaign[], employees: Employee[], events: TrackingEvent[]): void {
    const s = this.summariseEvents(events);
    const overallClickRate = s.delivered > 0 ? Math.round((s.clicked / s.delivered) * 100) : 0;
    const headers = ['Metric', 'Value'];
    const rows: (string | number)[][] = [
      ['Total Campaigns', campaigns.length],
      ['Active Campaigns', campaigns.filter(c => c.status === 'active').length],
      ['Total Employees', employees.length],
      ['Emails Delivered', s.delivered],
      ['Emails Opened', s.opened],
      ['Links Clicked', s.clicked],
      ['Credential Attempts', s.credentialAttempts],
      ['Overall Click Rate', `${overallClickRate}%`],
    ];
    this.downloadCSV('executive_summary', headers, rows);
  }

  exportCampaignSummaryCSV(campaigns: Campaign[], events: TrackingEvent[]): void {
    const headers = ['Campaign', 'Status', 'Template', 'Delivered', 'Opened', 'Clicked', 'Cred Attempts', 'Click Rate'];
    const rows = campaigns.map(c => {
      const ce = this.deduplicateEvents(events.filter(e => e.campaignId === c.id));
      const d = ce.filter(e => e.eventType === 'email_delivered').length;
      const o = ce.filter(e => e.eventType === 'email_opened').length;
      const cl = ce.filter(e => e.eventType === 'link_clicked').length;
      const cr = ce.filter(e => e.eventType === 'credential_attempt').length;
      return [c.name, c.status, c.templateName || '—', d, o, cl, cr, d > 0 ? `${Math.min(100, Math.round((cl / d) * 100))}%` : '0%'];
    });
    this.downloadCSV('campaign_summary', headers, rows);
  }

  exportEmployeeFailureCSV(employees: Employee[], events: TrackingEvent[], campaigns: Campaign[]): void {
    const headers = ['Name', 'Email', 'Department', 'Risk Score', 'Level', 'Campaigns Targeted', 'Clicked', 'Cred Submitted'];
    const rows = employees.map(emp => {
      const ee = this.deduplicateEvents(events.filter(e => e.employeeId === emp.id || (emp.email && e.employeeEmail === emp.email)));
      const score = this.computeRiskScore(emp, events);
      return [
        `${emp.firstName} ${emp.lastName}`, emp.email, emp.department, `${score}%`,
        score >= 70 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW',
        new Set(ee.map(e => e.campaignId)).size,
        ee.filter(e => e.eventType === 'link_clicked').length,
        ee.filter(e => e.eventType === 'credential_attempt').length,
      ];
    });
    this.downloadCSV('employee_vulnerability', headers, rows);
  }

  exportDepartmentRiskCSV(deptStats: DepartmentStat[]): void {
    const headers = ['Department', 'Employees', 'Clicked', 'Cred Attempts', 'Click Rate', 'Avg Risk'];
    const rows = deptStats.map(d => [d.department, d.totalCount, d.clicked, d.credentialAttempts, `${d.clickRate}%`, `${d.avgRiskScore}%`]);
    this.downloadCSV('department_risk', headers, rows);
  }

  private downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ─── PDF: Executive Summary ───────────────────────────────────────────

  async exportExecutiveSummaryPDF(
    campaigns: Campaign[], employees: Employee[], events: TrackingEvent[], preview = false
  ): Promise<string | void> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    const pw = doc.internal.pageSize.width;

    const s = this.summariseEvents(events);
    const activeCamps = campaigns.filter(c => c.status === 'active').length;
    const completedCamps = campaigns.filter(c => c.status === 'completed').length;
    const clickRate = s.delivered > 0 ? Math.round((s.clicked / s.delivered) * 100) : 0;
    const openRate = s.delivered > 0 ? Math.round((s.opened / s.delivered) * 100) : 0;
    const compromiseRate = s.delivered > 0 ? Math.round((s.credentialAttempts / s.delivered) * 100) : 0;

    let highRisk = 0, medRisk = 0, lowRisk = 0;
    employees.forEach(e => {
      const sc = this.computeRiskScore(e, events);
      if (sc >= 70) highRisk++; else if (sc >= 30) medRisk++; else lowRisk++;
    });

    // Header
    let y = this.drawHeader(doc, 'Executive Summary Report', 'High-level overview of phishing simulation performance');

    // KPI Cards Row 1
    const cardW = (pw - 42) / 4;
    this.drawKpiCard(doc, 14, y, cardW, 'Total Campaigns', String(campaigns.length), [37, 99, 235]);
    this.drawKpiCard(doc, 14 + cardW + 4, y, cardW, 'Active', String(activeCamps), [52, 199, 89]);
    this.drawKpiCard(doc, 14 + (cardW + 4) * 2, y, cardW, 'Completed', String(completedCamps), [88, 86, 214]);
    this.drawKpiCard(doc, 14 + (cardW + 4) * 3, y, cardW, 'Employees', String(employees.length), [255, 149, 0]);
    y += 36;

    // KPI Cards Row 2
    this.drawKpiCard(doc, 14, y, cardW, 'Emails Delivered', String(s.delivered), [37, 99, 235]);
    this.drawKpiCard(doc, 14 + cardW + 4, y, cardW, 'Open Rate', `${openRate}%`, [15, 190, 216]);
    this.drawKpiCard(doc, 14 + (cardW + 4) * 2, y, cardW, 'Click Rate', `${clickRate}%`, [255, 149, 0]);
    this.drawKpiCard(doc, 14 + (cardW + 4) * 3, y, cardW, 'Compromise Rate', `${compromiseRate}%`, [255, 59, 48]);
    y += 42;

    // Phishing Funnel
    y = this.drawSectionTitle(doc, y, 'Phishing Simulation Funnel');
    autoTable(doc, {
      startY: y,
      head: [['Stage', 'Count', 'Rate', 'Status']],
      body: [
        ['Delivered', String(s.delivered), '100%', 'Baseline'],
        ['Opened', String(s.opened), `${openRate}%`, openRate > 50 ? 'Above avg' : 'Normal'],
        ['Clicked', String(s.clicked), `${clickRate}%`, clickRate > 15 ? 'HIGH' : 'Within target'],
        ['Credentials Submitted', String(s.credentialAttempts), `${compromiseRate}%`, compromiseRate > 0 ? 'ACTION NEEDED' : 'Safe'],
      ],
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: { 1: { halign: 'center' as const }, 2: { halign: 'center' as const }, 3: { halign: 'center' as const } },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 3) {
          const val = String(data.cell.raw);
          if (val === 'ACTION NEEDED') { data.cell.styles.textColor = [255, 59, 48]; data.cell.styles.fontStyle = 'bold'; }
          else if (val === 'HIGH') { data.cell.styles.textColor = [255, 149, 0]; data.cell.styles.fontStyle = 'bold'; }
          else { data.cell.styles.textColor = [52, 199, 89]; }
        }
      }
    });
    y = (doc as any).lastAutoTable.finalY + 14;

    // Risk Distribution
    y = this.drawSectionTitle(doc, y, 'Employee Risk Distribution', [255, 59, 48]);
    autoTable(doc, {
      startY: y,
      head: [['Risk Level', 'Employees', '% of Workforce', 'Action Required']],
      body: [
        ['High Risk (70-100)', String(highRisk), `${employees.length > 0 ? Math.round((highRisk / employees.length) * 100) : 0}%`, highRisk > 0 ? 'Immediate training' : 'None'],
        ['Medium Risk (30-69)', String(medRisk), `${employees.length > 0 ? Math.round((medRisk / employees.length) * 100) : 0}%`, medRisk > 0 ? 'Awareness training' : 'None'],
        ['Low Risk (0-29)', String(lowRisk), `${employees.length > 0 ? Math.round((lowRisk / employees.length) * 100) : 0}%`, 'Continue monitoring'],
      ],
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [10, 37, 64], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 248, 248] },
      columnStyles: { 1: { halign: 'center' as const }, 2: { halign: 'center' as const } },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 0) {
          const val = String(data.cell.raw);
          if (val.includes('High')) { data.cell.styles.textColor = [255, 59, 48]; data.cell.styles.fontStyle = 'bold'; }
          else if (val.includes('Medium')) { data.cell.styles.textColor = [255, 149, 0]; data.cell.styles.fontStyle = 'bold'; }
          else { data.cell.styles.textColor = [52, 199, 89]; data.cell.styles.fontStyle = 'bold'; }
        }
      }
    });

    this.drawFooter(doc);
    if (preview) return doc.output('bloburl').toString();
    doc.save(`executive_summary_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ─── PDF: Campaign Summary ────────────────────────────────────────────

  async exportCampaignSummaryPDF(campaigns: Campaign[], events: TrackingEvent[], preview = false): Promise<string | void> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF('landscape');

    let y = this.drawHeader(doc, 'Campaign Summary Report', `${campaigns.length} campaigns analyzed`);

    // KPI Row
    const pw = doc.internal.pageSize.width;
    const s = this.summariseEvents(events);
    const cardW = (pw - 42) / 4;
    this.drawKpiCard(doc, 14, y, cardW, 'Total Campaigns', String(campaigns.length), [37, 99, 235]);
    this.drawKpiCard(doc, 14 + cardW + 4, y, cardW, 'Emails Sent', String(s.delivered), [52, 199, 89]);
    this.drawKpiCard(doc, 14 + (cardW + 4) * 2, y, cardW, 'Total Clicks', String(s.clicked), [255, 149, 0]);
    this.drawKpiCard(doc, 14 + (cardW + 4) * 3, y, cardW, 'Credentials Captured', String(s.credentialAttempts), [255, 59, 48]);
    y += 40;

    y = this.drawSectionTitle(doc, y, 'Campaign Breakdown');
    autoTable(doc, {
      startY: y,
      head: [['Campaign', 'Status', 'Template', 'Delivered', 'Opened', 'Clicked', 'Cred Attempts', 'Click Rate']],
      body: campaigns.map(c => {
        const ce = this.deduplicateEvents(events.filter(e => e.campaignId === c.id));
        const d = ce.filter(e => e.eventType === 'email_delivered').length;
        const o = ce.filter(e => e.eventType === 'email_opened').length;
        const cl = ce.filter(e => e.eventType === 'link_clicked').length;
        const cr = ce.filter(e => e.eventType === 'credential_attempt').length;
        const clickR = d > 0 ? Math.min(100, Math.round((cl / d) * 100)) : 0;
        return [c.name, c.status.charAt(0).toUpperCase() + c.status.slice(1), c.templateName || '-', d, o, cl, cr, `${clickR}%`];
      }),
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        3: { halign: 'center' as const }, 4: { halign: 'center' as const },
        5: { halign: 'center' as const }, 6: { halign: 'center' as const },
        7: { halign: 'center' as const }, 8: { halign: 'center' as const },
      },
      margin: { left: 14, right: 14 },
    });

    this.drawFooter(doc);
    if (preview) return doc.output('bloburl').toString();
    doc.save(`campaign_summary_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ─── PDF: Employee Vulnerability ──────────────────────────────────────

  async exportEmployeeFailurePDF(
    employees: Employee[], events: TrackingEvent[], campaigns: Campaign[], preview = false
  ): Promise<string | void> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF('landscape');

    const failedEmps = employees.filter(emp => {
      const ee = events.filter(e => e.employeeId === emp.id || (emp.email && e.employeeEmail === emp.email));
      return ee.some(e => e.eventType === 'link_clicked' || e.eventType === 'credential_attempt');
    });

    let y = this.drawHeader(doc, 'Employee Vulnerability Report', `${failedEmps.length} of ${employees.length} employees with vulnerabilities`);

    // KPI Row
    const pw = doc.internal.pageSize.width;
    const cardW = (pw - 42) / 4;
    this.drawKpiCard(doc, 14, y, cardW, 'Total Employees', String(employees.length), [88, 86, 214]);
    this.drawKpiCard(doc, 14 + cardW + 4, y, cardW, 'Vulnerable', String(failedEmps.length), [255, 59, 48]);
    const vulnRate = employees.length > 0 ? Math.round((failedEmps.length / employees.length) * 100) : 0;
    this.drawKpiCard(doc, 14 + (cardW + 4) * 2, y, cardW, 'Vulnerability Rate', `${vulnRate}%`, [255, 149, 0]);
    const safeCount = employees.length - failedEmps.length;
    this.drawKpiCard(doc, 14 + (cardW + 4) * 3, y, cardW, 'Safe Employees', String(safeCount), [52, 199, 89]);
    y += 40;

    y = this.drawSectionTitle(doc, y, 'Employee Details', [255, 59, 48]);
    autoTable(doc, {
      startY: y,
      head: [['Name', 'Email', 'Department', 'Risk Score', 'Level', 'Campaigns', 'Opened', 'Clicked', 'Cred Submitted', 'Failed In']],
      body: employees.map(emp => {
        const ee = this.deduplicateEvents(events.filter(e => e.employeeId === emp.id || (emp.email && e.employeeEmail === emp.email)));
        const score = this.computeRiskScore(emp, events);
        const targeted = new Set(ee.map(e => e.campaignId)).size;
        const failedIds = new Set([
          ...ee.filter(e => e.eventType === 'link_clicked').map(e => e.campaignId),
          ...ee.filter(e => e.eventType === 'credential_attempt').map(e => e.campaignId),
        ]);
        const failedNames = [...failedIds]
          .map(id => {
            const camp = campaigns.find(c => c.id === id);
            return camp?.name || camp?.templateName || null;
          })
          .filter(n => n !== null)
          .join(', ');
        const opened = ee.filter(e => e.eventType === 'email_opened').length;
        return [
          `${emp.firstName} ${emp.lastName}`, emp.email, emp.department,
          `${score}%`, score >= 70 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW',
          targeted, opened,
          ee.filter(e => e.eventType === 'link_clicked').length,
          ee.filter(e => e.eventType === 'credential_attempt').length,
          failedNames || '-'
        ];
      }),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [10, 37, 64], textColor: 255, fontStyle: 'bold', fontSize: 8 },
      alternateRowStyles: { fillColor: [255, 248, 248] },
      columnStyles: {
        3: { halign: 'center' as const }, 4: { halign: 'center' as const },
        5: { halign: 'center' as const }, 6: { halign: 'center' as const },
        7: { halign: 'center' as const }, 8: { halign: 'center' as const },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 4) {
          if (data.cell.raw === 'HIGH') { data.cell.styles.textColor = [255, 59, 48]; data.cell.styles.fontStyle = 'bold'; }
          else if (data.cell.raw === 'MEDIUM') { data.cell.styles.textColor = [255, 149, 0]; data.cell.styles.fontStyle = 'bold'; }
          else { data.cell.styles.textColor = [52, 199, 89]; }
        }
      }
    });

    this.drawFooter(doc);
    if (preview) return doc.output('bloburl').toString();
    doc.save(`employee_vulnerability_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  // ─── PDF: Department Risk ─────────────────────────────────────────────

  async exportDepartmentRiskPDF(deptStats: DepartmentStat[], preview = false): Promise<string | void> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();

    let y = this.drawHeader(doc, 'Department Risk Report', `${deptStats.length} departments analyzed`);

    // KPI Row
    const pw = doc.internal.pageSize.width;
    const cardW = (pw - 38) / 3;
    const totalEmps = deptStats.reduce((a, d) => a + d.totalCount, 0);
    const totalClicked = deptStats.reduce((a, d) => a + d.clicked, 0);
    const totalCreds = deptStats.reduce((a, d) => a + d.credentialAttempts, 0);
    this.drawKpiCard(doc, 14, y, cardW, 'Total Employees', String(totalEmps), [88, 86, 214]);
    this.drawKpiCard(doc, 14 + cardW + 5, y, cardW, 'Total Clicks', String(totalClicked), [255, 149, 0]);
    this.drawKpiCard(doc, 14 + (cardW + 5) * 2, y, cardW, 'Credential Attempts', String(totalCreds), [255, 59, 48]);
    y += 40;

    y = this.drawSectionTitle(doc, y, 'Department Breakdown', [52, 199, 89]);
    autoTable(doc, {
      startY: y,
      head: [['Department', 'Employees', 'Clicked', 'Cred Attempts', 'Click Rate', 'Avg Risk', 'Risk Level']],
      body: deptStats.map(d => [
        d.department, d.totalCount, d.clicked, d.credentialAttempts,
        `${d.clickRate}%`, `${d.avgRiskScore}%`,
        d.avgRiskScore >= 70 ? 'HIGH' : d.avgRiskScore >= 30 ? 'MEDIUM' : 'LOW'
      ]),
      styles: { fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [52, 199, 89], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 255, 248] },
      columnStyles: {
        1: { halign: 'center' as const }, 2: { halign: 'center' as const },
        3: { halign: 'center' as const }, 4: { halign: 'center' as const },
        5: { halign: 'center' as const }, 6: { halign: 'center' as const },
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.column.index === 6) {
          if (data.cell.raw === 'HIGH') { data.cell.styles.textColor = [255, 59, 48]; data.cell.styles.fontStyle = 'bold'; }
          else if (data.cell.raw === 'MEDIUM') { data.cell.styles.textColor = [255, 149, 0]; data.cell.styles.fontStyle = 'bold'; }
          else { data.cell.styles.textColor = [52, 199, 89]; data.cell.styles.fontStyle = 'bold'; }
        }
      }
    });

    this.drawFooter(doc);
    if (preview) return doc.output('bloburl').toString();
    doc.save(`department_risk_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
