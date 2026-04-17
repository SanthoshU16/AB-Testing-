import { Injectable } from '@angular/core';
import { Employee } from '../models/employee.model';
import { Campaign } from '../models/campaign.model';
import { TrackingEvent } from '../models/tracking-event.model';
import { DepartmentStat } from './analytics.service';

@Injectable({ providedIn: 'root' })
export class ReportService {

  // ─── CSV Export ────────────────────────────────────────────────────────

  exportCampaignSummaryCSV(campaigns: Campaign[]): void {
    const headers = ['Campaign Name', 'Status', 'Template', 'Departments', 'Total Sent', 'Delivered', 'Opened', 'Clicked', 'Cred Attempts', 'Click Rate'];
    const rows = campaigns.map(c => [
      c.name,
      c.status,
      c.templateName,
      c.targetDepartments.join(' | '),
      c.stats?.totalSent ?? 0,
      c.stats?.delivered ?? 0,
      c.stats?.opened ?? 0,
      c.stats?.clicked ?? 0,
      c.stats?.credentialAttempts ?? 0,
      c.stats?.totalSent ? `${Math.round((c.stats.clicked / c.stats.totalSent) * 100)}%` : '0%'
    ]);
    this.downloadCSV('campaign_summary', headers, rows);
  }

  exportEmployeeFailureCSV(employees: Employee[], events: TrackingEvent[]): void {
    const headers = ['Name', 'Email', 'Department', 'Risk Score', 'Risk Level', 'Clicked', 'Cred Attempt'];
    const rows = employees.map(emp => {
      const empEvents = events.filter(e => e.employeeId === emp.id);
      const clicked = empEvents.some(e => e.eventType === 'link_clicked');
      const credAttempt = empEvents.some(e => e.eventType === 'credential_attempt');
      const score = emp.riskScore ?? 0;
      const level = score >= 70 ? 'High' : score >= 30 ? 'Medium' : 'Low';
      return [
        `${emp.firstName} ${emp.lastName}`,
        emp.email,
        emp.department,
        score,
        level,
        clicked ? 'Yes' : 'No',
        credAttempt ? 'Yes' : 'No'
      ];
    });
    this.downloadCSV('employee_failure_report', headers, rows);
  }

  exportDepartmentRiskCSV(deptStats: DepartmentStat[]): void {
    const headers = ['Department', 'Total Employees', 'Clicked', 'Cred Attempts', 'Click Rate', 'Avg Risk Score'];
    const rows = deptStats.map(d => [
      d.department, d.totalCount, d.clicked,
      d.credentialAttempts, `${d.clickRate}%`, `${d.avgRiskScore}%`
    ]);
    this.downloadCSV('department_risk_report', headers, rows);
  }

  private downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── PDF Export ────────────────────────────────────────────────────────

  async exportCampaignSummaryPDF(campaigns: Campaign[]): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Campaign Summary Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Campaign', 'Status', 'Sent', 'Clicked', 'Click Rate']],
      body: campaigns.map(c => [
        c.name,
        c.status.toUpperCase(),
        c.stats?.totalSent ?? 0,
        c.stats?.clicked ?? 0,
        c.stats?.totalSent ? `${Math.round((c.stats.clicked / c.stats.totalSent) * 100)}%` : '0%'
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [10, 132, 255] }
    });

    doc.save(`campaign_summary_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  async exportEmployeeFailurePDF(employees: Employee[], events: TrackingEvent[]): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Employee Failure Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Email', 'Department', 'Risk Score', 'Level', 'Clicked', 'Cred Attempt']],
      body: employees.map(emp => {
        const empEvents = events.filter(e => e.employeeId === emp.id);
        const score = emp.riskScore ?? 0;
        return [
          `${emp.firstName} ${emp.lastName}`,
          emp.email,
          emp.department,
          `${score}%`,
          score >= 70 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW',
          empEvents.some(e => e.eventType === 'link_clicked') ? 'Yes' : 'No',
          empEvents.some(e => e.eventType === 'credential_attempt') ? 'Yes' : 'No'
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 59, 48] }
    });

    doc.save(`employee_failure_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  async exportDepartmentRiskPDF(deptStats: DepartmentStat[]): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Department Risk Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Department', 'Employees', 'Clicked', 'Cred Attempts', 'Click Rate', 'Avg Risk']],
      body: deptStats.map(d => [
        d.department, d.totalCount, d.clicked,
        d.credentialAttempts, `${d.clickRate}%`, `${d.avgRiskScore}%`
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [52, 199, 89] }
    });

    doc.save(`department_risk_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
