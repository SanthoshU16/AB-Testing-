import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TrackingService } from './tracking.service';
import { TrackingEvent } from '../models/tracking-event.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private lastViewedKey = 'ab_last_viewed_notifications';

  constructor(private trackingService: TrackingService) {
    this.trackingService.events$.subscribe(events => {
      this.calculateUnreadCount(events);
    });
  }

  private calculateUnreadCount(events: TrackingEvent[]) {
    const lastViewedStr = localStorage.getItem(this.lastViewedKey);
    const lastViewed = lastViewedStr ? parseInt(lastViewedStr, 10) : 0;
    
    // Count events happened after lastViewed
    // If no lastViewed, show top 5 as new or just show 0
    const unread = events.filter(e => e.timestamp > lastViewed).length;
    this.unreadCountSubject.next(unread);
  }

  markAllAsRead() {
    const now = Date.now();
    localStorage.setItem(this.lastViewedKey, now.toString());
    this.unreadCountSubject.next(0);
  }
}
