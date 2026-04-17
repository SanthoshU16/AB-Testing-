import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrackingService } from '../../services/tracking.service';
import { EmployeeService } from '../../services/employee.service';

type Phase = 'loading' | 'landing' | 'submitted';

@Component({
  selector: 'app-phishing-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phishing-landing.component.html',
  styleUrls: ['./phishing-landing.component.css']
})
export class PhishingLandingComponent implements OnInit {
  phase: Phase = 'loading';
  campaignId = '';
  employeeId = '';
  fakeUsername = '';
  fakePassword = '';
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private trackingService: TrackingService,
    private employeeService: EmployeeService
  ) {}

  async ngOnInit(): Promise<void> {
    this.campaignId = this.route.snapshot.paramMap.get('campaignId') ?? '';
    this.employeeId = this.route.snapshot.paramMap.get('employeeId') ?? '';

    // Log link_clicked event
    await this.employeeService.loadEmployees();
    const employees = this.employeeService['employeesSubject'].value;
    const emp = employees.find((e: any) => e.id === this.employeeId);

    await this.trackingService.logEvent({
      campaignId: this.campaignId,
      employeeId: this.employeeId,
      employeeEmail: emp?.email ?? '',
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : '',
      department: emp?.department ?? '',
      eventType: 'link_clicked',
      credentialAttempted: false
    });

    this.phase = 'landing';
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting || !this.fakeUsername) return;
    this.isSubmitting = true;

    // Log credential_attempt — DO NOT store password
    await this.trackingService.logEvent({
      campaignId: this.campaignId,
      employeeId: this.employeeId,
      employeeEmail: this.fakeUsername,
      eventType: 'credential_attempt',
      credentialAttempted: true
    });

    this.phase = 'submitted';
    this.isSubmitting = false;
  }
}
