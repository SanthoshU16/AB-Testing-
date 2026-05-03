import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { Campaign } from '../models/campaign.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private apiUrl = `${environment.apiUrl}/campaigns`;
  private campaignsSubject = new BehaviorSubject<Campaign[]>([]);
  public campaigns$ = this.campaignsSubject.asObservable();

  constructor(private http: HttpClient) {}

  async loadCampaigns(): Promise<void> {
    this.http.get<Campaign[]>(this.apiUrl).subscribe(data => {
      this.campaignsSubject.next(data || []);
    });
  }

  async createCampaign(campaign: Partial<Campaign>): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.post(this.apiUrl, campaign, { responseType: 'text' }).subscribe({
        next: (id) => {
          this.loadCampaigns();
          resolve(id);
        },
        error: (err) => reject(err)
      });
    });
  }

  async launchCampaign(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.post(`${this.apiUrl}/${id}/launch`, {}).subscribe({
        next: () => resolve(),
        error: (err) => reject(err)
      });
    });
  }

  async getCampaign(id: string): Promise<Campaign | null> {
    return new Promise((resolve) => {
      this.http.get<Campaign>(`${this.apiUrl}/${id}`).subscribe({
        next: (c) => resolve(c),
        error: () => resolve(null)
      });
    });
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.put(`${this.apiUrl}/${id}`, updates).subscribe({
        next: () => {
          this.loadCampaigns();
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  async deleteCampaign(id: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.loadCampaigns();
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  async deleteAllCampaigns(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/all`).subscribe({
        next: () => {
          this.loadCampaigns();
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }
}
