import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CampaignService } from '../../../../services/campaign.service';
import { TemplateService } from '../../../../services/template.service';
import { EmployeeService } from '../../../../services/employee.service';
import { AuthService } from '../../../../services/auth.service';
import { PhishingTemplate } from '../../../../models/template.model';
import { Employee } from '../../../../models/employee.model';
import { DeptCountPipe } from '../../../../shared/pipes/dept-count.pipe';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-campaign-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DeptCountPipe],
  templateUrl: './campaign-create.component.html',
  styleUrls: ['./campaign-create.component.css']
})
export class CampaignCreateComponent implements OnInit {
  currentStep = 1;
  totalSteps = 4;
  isSaving = false;

  templates: PhishingTemplate[] = [];
  employees: Employee[] = [];
  departments: string[] = [];

  // Form state
  name = '';
  description = '';
  selectedTemplateId = '';
  selectedTemplateName = '';
  targetMode: 'departments' | 'employees' = 'departments';
  selectedDepartments: string[] = [];
  selectedEmployeeIds: string[] = [];
  scheduleType: 'now' | 'later' = 'now';
  scheduledAt: string = '';

  constructor(
    private campaignService: CampaignService,
    private templateService: TemplateService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.templateService.seedDefaultTemplates();
    await this.templateService.loadTemplates();
    await this.employeeService.loadEmployees();

    this.templateService.templates$.subscribe(t => this.templates = t);
    this.employeeService.employees$.subscribe(emps => {
      this.employees = emps;
      this.departments = [...new Set(emps.map(e => e.department))].sort();
    });
  }

  // Navigation
  next(): void { if (this.currentStep < this.totalSteps && this.canProceed()) this.currentStep++; }
  back(): void { if (this.currentStep > 1) this.currentStep--; }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.name && !!this.selectedTemplateId;
      case 2: return this.targetMode === 'departments'
        ? this.selectedDepartments.length > 0
        : this.selectedEmployeeIds.length > 0;
      case 3: return true;
      default: return true;
    }
  }

  selectTemplate(tpl: PhishingTemplate): void {
    this.selectedTemplateId = tpl.id!;
    this.selectedTemplateName = tpl.name;
  }

  toggleDepartment(dept: string): void {
    const idx = this.selectedDepartments.indexOf(dept);
    if (idx >= 0) this.selectedDepartments.splice(idx, 1);
    else this.selectedDepartments.push(dept);
  }

  toggleEmployee(id: string): void {
    const idx = this.selectedEmployeeIds.indexOf(id);
    if (idx >= 0) this.selectedEmployeeIds.splice(idx, 1);
    else this.selectedEmployeeIds.push(id);
  }

  isDeptSelected(dept: string): boolean { return this.selectedDepartments.includes(dept); }
  isEmpSelected(id: string): boolean { return this.selectedEmployeeIds.includes(id ?? ''); }

  getTargetCount(): number {
    if (this.targetMode === 'departments') {
      return this.employees.filter(e => this.selectedDepartments.includes(e.department)).length;
    }
    return this.selectedEmployeeIds.length;
  }

  async launch(): Promise<void> {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      const targetEmployeeIds = this.targetMode === 'departments'
        ? this.employees.filter(e => this.selectedDepartments.includes(e.department)).map(e => e.id!)
        : this.selectedEmployeeIds;

      let scheduledAt = null;
      if (this.scheduleType === 'later' && this.scheduledAt) {
        scheduledAt = Timestamp.fromDate(new Date(this.scheduledAt));
      }

      await this.campaignService.createCampaign({
        name: this.name,
        description: this.description,
        templateId: this.selectedTemplateId,
        templateName: this.selectedTemplateName,
        targetDepartments: this.selectedDepartments,
        targetEmployeeIds,
        status: this.scheduleType === 'later' ? 'scheduled' : 'active',
        scheduledAt,
        sentAt: this.scheduleType === 'now' ? Timestamp.now() : null,
        completedAt: null,
        createdBy: this.authService.currentProfile?.uid ?? 'admin'
      });

      this.router.navigate(['/admin/campaigns']);
    } catch (e) {
      console.error(e);
      alert('Failed to create campaign.');
    } finally {
      this.isSaving = false;
    }
  }

  cancel(): void { this.router.navigate(['/admin/campaigns']); }
}
