import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, combineLatest } from 'rxjs';
import { EmployeeService } from '../../../../services/employee.service';
import { TrackingService } from '../../../../services/tracking.service';
import { Employee } from '../../../../models/employee.model';
import { TrackingEvent } from '../../../../models/tracking-event.model';
import { EmployeeAddComponent } from '../employee-add/employee-add.component';

interface EmployeeWithRisk extends Employee {
  dynamicRiskScore: number;
}

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeeAddComponent],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: EmployeeWithRisk[] = [];
  filteredEmployees: EmployeeWithRisk[] = [];
  searchQuery = '';
  isAddModalOpen = false;
  isImporting = false;
  importPreview: Employee[] = [];
  importError: string | null = null;
  showImportPreview = false;
  private sub?: Subscription;
  private events: TrackingEvent[] = [];

  constructor(
    private employeeService: EmployeeService,
    private trackingService: TrackingService
  ) {}

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.employeeService.loadEmployees(),
      this.trackingService.loadAllEvents()
    ]);

    this.sub = combineLatest([
      this.employeeService.employees$,
      this.trackingService.events$
    ]).subscribe(([emps, evts]) => {
      this.events = evts;
      this.employees = emps.map(emp => ({
        ...emp,
        dynamicRiskScore: this.computeRiskScore(emp, evts)
      }));
      this.applyFilter();
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  /** Compute dynamic risk score from deduplicated tracking events */
  private computeRiskScore(emp: Employee, events: TrackingEvent[]): number {
    const empEvents = events.filter(ev =>
      ev.employeeId === emp.id || (emp.email && ev.employeeEmail === emp.email)
    );
    const uniqueClicked = new Set(
      empEvents.filter(e => e.eventType === 'link_clicked').map(e => e.campaignId)
    );
    const uniqueCreds = new Set(
      empEvents.filter(e => e.eventType === 'credential_attempt').map(e => e.campaignId)
    );
    const score = (emp.riskScore || 0) + (uniqueClicked.size * 30) + (uniqueCreds.size * 50);
    return Math.min(score, 100);
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredEmployees = [...this.employees];
      return;
    }
    const terms = this.searchQuery.toLowerCase().trim().split(/\s+/);
    
    this.filteredEmployees = this.employees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const dept = (emp.department || '').toLowerCase();
      
      // Ensure all search terms match either the name or the department
      return terms.every(term => fullName.includes(term) || dept.includes(term));
    });
  }

  getRiskColor(score: number | undefined): string {
    if (score === undefined) return '#86868b';
    if (score < 30) return '#34c759';
    if (score < 70) return '#ff9500';
    return '#ff3b30';
  }

  getRiskLabel(score: number | undefined): string {
    if (score === undefined || score === 0) return 'Low';
    if (score < 30) return 'Low';
    if (score < 70) return 'Medium';
    return 'High';
  }

  openAddModal(): void { this.isAddModalOpen = true; }
  closeAddModal(): void { this.isAddModalOpen = false; }

  deleteEmployee(id: string | undefined): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id);
    }
  }

  // ── CSV Import ─────────────────────────────────────────────────────────

  triggerFileInput(): void {
    document.getElementById('csvFileInput')?.click();
  }

  onCSVFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.name.endsWith('.csv')) {
      this.importError = 'Please select a valid .csv file.';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      this.parseCSV(text);
    };
    reader.readAsText(file);
    // Reset input so the same file can be selected again
    input.value = '';
  }

  private parseCSV(text: string): void {
    this.importError = null;
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      this.importError = 'CSV must have a header row and at least one data row.';
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const required = ['firstname', 'lastname', 'email', 'department'];
    const missing = required.filter(r => !headers.includes(r));
    if (missing.length > 0) {
      this.importError = `CSV missing required columns: ${missing.join(', ')}. Expected: firstName, lastName, email, department`;
      return;
    }

    const employees: Employee[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });

      const emp: Employee = {
        firstName: row['firstname'],
        lastName: row['lastname'],
        email: row['email'],
        department: row['department'],
        role: row['role'] || undefined,
        status: (row['status'] as 'active' | 'inactive') || 'active',
        riskScore: 0
      };

      if (!emp.firstName || !emp.lastName || !emp.email || !emp.department) continue;
      employees.push(emp);
    }

    if (employees.length === 0) {
      this.importError = 'No valid employee rows found in the CSV.';
      return;
    }

    this.importPreview = employees;
    this.showImportPreview = true;
  }

  async confirmImport(): Promise<void> {
    if (this.isImporting) return;
    this.isImporting = true;
    try {
      await this.employeeService.uploadMultipleEmployees(this.importPreview);
      this.showImportPreview = false;
      this.importPreview = [];
    } catch (e) {
      console.error(e);
      alert('Failed to import employees.');
    } finally {
      this.isImporting = false;
    }
  }

  cancelImport(): void {
    this.showImportPreview = false;
    this.importPreview = [];
    this.importError = null;
  }
}
