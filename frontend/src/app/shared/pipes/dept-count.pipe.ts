import { Pipe, PipeTransform } from '@angular/core';
import { Employee } from '../../models/employee.model';

@Pipe({ name: 'deptCount', standalone: true })
export class DeptCountPipe implements PipeTransform {
  transform(employees: Employee[], department: string): number {
    return employees.filter(e => e.department === department).length;
  }
}
