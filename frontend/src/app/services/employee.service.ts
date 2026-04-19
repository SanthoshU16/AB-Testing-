import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, firstValueFrom } from 'rxjs';
import { Employee } from '../models/employee.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  public employees$ = this.employeesSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadEmployees(): void {
    this.http.get<Employee[]>(this.apiUrl)
      .pipe(
        catchError(error => {
          console.error('Error fetching employees:', error);
          return of([]);
        })
      )
      .subscribe(data => {
        this.employeesSubject.next(data);
      });
  }

  addEmployee(employee: Employee): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl, employee, { responseType: 'text' }).subscribe({
        next: (id) => {
          this.loadEmployees();
          resolve(id);
        },
        error: (err) => {
          console.error('Add employee error:', err);
          reject(err);
        }
      });
    });
  }

  deleteEmployee(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadEmployees();
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  async uploadMultipleEmployees(employees: Employee[]): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/bulk`, employees));
      this.loadEmployees();
    } catch (err) {
      console.error('Bulk upload error:', err);
      throw err;
    }
  }
}
