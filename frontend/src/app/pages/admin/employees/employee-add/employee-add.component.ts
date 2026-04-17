import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../../../services/employee.service';
import { Employee } from '../../../../models/employee.model';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.css']
})
export class EmployeeAddComponent {
  @Output() close = new EventEmitter<void>();
  @Output() onAdded = new EventEmitter<void>();

  employee: Partial<Employee> = {
    status: 'active',
    department: ''
  };

  isSubmitting = false;

  constructor(private employeeService: EmployeeService) {}

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) return;
    
    if (!this.employee.firstName || !this.employee.lastName || !this.employee.email || !this.employee.department) {
      alert('Please fill out all required fields.');
      return;
    }

    this.isSubmitting = true;
    try {
      await this.employeeService.addEmployee(this.employee as Employee);
      this.onAdded.emit();
      this.close.emit();
    } catch (error) {
      console.error('Failed to add employee:', error);
      alert('Failed to add employee. Please try again.');
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel(): void {
    this.close.emit();
  }
}
