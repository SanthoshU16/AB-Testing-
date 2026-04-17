import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { PhishingTemplate } from '../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = 'http://localhost:8080/api/templates';
  private templatesSubject = new BehaviorSubject<PhishingTemplate[]>([]);
  public templates$ = this.templatesSubject.asObservable();

  constructor(private http: HttpClient) {}

  async loadTemplates(): Promise<void> {
    this.http.get<PhishingTemplate[]>(this.apiUrl).subscribe(data => {
      this.templatesSubject.next(data || []);
    });
  }

  async getTemplate(id: string): Promise<PhishingTemplate | null> {
    return new Promise((resolve) => {
      this.http.get<PhishingTemplate>(`${this.apiUrl}/${id}`).subscribe({
        next: (t) => resolve(t),
        error: () => resolve(null)
      });
    });
  }

  async createTemplate(template: PhishingTemplate): Promise<string> {
    return this.saveTemplate(template);
  }

  async updateTemplate(id: string, template: Partial<PhishingTemplate>): Promise<void> {
    await this.saveTemplate({ ...template, id });
  }

  async saveTemplate(template: Partial<PhishingTemplate>): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl, template, { responseType: 'text' }).subscribe({
        next: (id) => {
          this.loadTemplates();
          resolve(id);
        },
        error: (err) => reject(err)
      });
    });
  }

  async deleteTemplate(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadTemplates();
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  async seedDefaultTemplates(): Promise<void> {
    // Placeholder to satisfy component, templates are managed in DB
    return Promise.resolve();
  }
}
