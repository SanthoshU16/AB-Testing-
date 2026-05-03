import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { TrackingEvent } from '../models/tracking-event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private apiUrl = `${environment.apiUrl}/tracking`;
  private eventsSubject = new BehaviorSubject<TrackingEvent[]>([]);
  public events$ = this.eventsSubject.asObservable();

  constructor(private http: HttpClient) {}

  async loadAllEvents(): Promise<void> {
    this.http.get<TrackingEvent[]>(this.apiUrl).subscribe(data => {
      this.eventsSubject.next(data || []);
    });
  }

  async loadEventsByCampaign(campaignId: string): Promise<TrackingEvent[]> {
    return new Promise((resolve) => {
      this.http.get<TrackingEvent[]>(`${this.apiUrl}/campaign/${campaignId}`).subscribe({
        next: (evts) => resolve(evts || []),
        error: () => resolve([])
      });
    });
  }

  async logEvent(event: Partial<TrackingEvent>): Promise<void> {
    return new Promise((resolve, reject) => {
      // Note: This calls the /public/log endpoint in Spring Boot
      this.http.post(`${this.apiUrl}/public/log`, event).subscribe({
        next: () => resolve(),
        error: (err) => reject(err)
      });
    });
  }

  async resetAllData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete(`${this.apiUrl}/reset`).subscribe({
        next: () => {
          this.eventsSubject.next([]);
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }
}
