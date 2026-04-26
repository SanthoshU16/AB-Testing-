import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TrackingService } from '../../../services/tracking.service';
import { NotificationService } from '../../../services/notification.service';

interface NotificationItem {
  type: 'success' | 'danger' | 'info' | 'warning';
  title: string;
  meta: string;
  time: number;
  badgeText: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="notifications-main">
      <div class="page-header">
        <h1 class="page-title">Notifications</h1>
        <p class="page-subtitle">All system alerts and tracking events across your organization.</p>
      </div>

      <div class="notifications-panel">
        <div class="activity-feed">
          <div class="activity-item" *ngFor="let activity of notifications">
            <div class="activity-dot" [ngClass]="activity.type"></div>
            <div class="activity-body">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-meta">{{ activity.meta }}</div>
            </div>
            <div class="activity-time">
              <span class="time-text">{{ activity.time | date:'MMM d, y, h:mm a' }}</span>
              <span class="activity-badge" [ngClass]="activity.type">{{ activity.badgeText }}</span>
            </div>
          </div>
          
          <div *ngIf="notifications.length === 0" class="activity-item empty-state">
            <div class="activity-body" style="text-align: center; padding: 48px 0;">
              <div class="activity-meta">No notifications to display.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .notifications-main {
      padding: 32px 40px;
      max-width: 1000px;
      margin: 0 auto;
      width: 100%;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0A2540;
      margin: 0 0 8px 0;
      letter-spacing: -0.03em;
    }

    .page-subtitle {
      font-size: 1rem;
      color: rgba(10, 37, 64, 0.6);
      margin: 0;
    }

    .notifications-panel {
      background: #ffffff;
      border-radius: 20px;
      padding: 24px 32px;
      border: 1px solid rgba(10, 37, 64, 0.04);
      box-shadow: 0 4px 24px rgba(10, 37, 64, 0.02);
    }

    .activity-feed {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(10, 37, 64, 0.06);
    }

    .activity-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .activity-item.empty-state {
      border-bottom: none;
      justify-content: center;
    }

    .activity-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .activity-dot.success { background-color: #34C759; box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.15); }
    .activity-dot.danger { background-color: #FF3B30; box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.15); }
    .activity-dot.info { background-color: #007AFF; box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15); }
    .activity-dot.warning { background-color: #FF9500; box-shadow: 0 0 0 4px rgba(255, 149, 0, 0.15); }

    .activity-body {
      flex: 1;
      min-width: 0;
    }

    .activity-title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: #0A2540;
      margin-bottom: 4px;
    }

    .activity-meta {
      font-size: 0.8125rem;
      color: rgba(10, 37, 64, 0.5);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .activity-time {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      flex-shrink: 0;
      min-width: 90px;
    }

    .time-text {
      font-size: 0.75rem;
      color: rgba(10, 37, 64, 0.4);
      font-weight: 500;
    }

    .activity-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .activity-badge.success { background: rgba(52, 199, 89, 0.1); color: #28A745; }
    .activity-badge.danger { background: rgba(255, 59, 48, 0.1); color: #D70015; }
    .activity-badge.info { background: rgba(0, 122, 255, 0.1); color: #007AFF; }
    .activity-badge.warning { background: rgba(255, 149, 0, 0.1); color: #E67E22; }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationItem[] = [];
  private sub?: Subscription;

  constructor(
    private trackingService: TrackingService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.trackingService.loadAllEvents();
    this.notificationService.markAllAsRead();
    
    this.sub = this.trackingService.events$.subscribe((evts: any[]) => {
      this.notifications = evts.map(evt => {
        let type: NotificationItem['type'] = 'info';
        let title = '';
        let badgeText = '';

        switch (evt.eventType) {
          case 'email_delivered':
            type = 'success';
            title = 'Phishing Simulation Delivered';
            badgeText = 'Delivered';
            break;
          case 'email_opened':
            type = 'info';
            title = 'Email Opened';
            badgeText = 'Opened';
            break;
          case 'link_clicked':
            type = 'warning';
            title = 'Link Clicked Warning';
            badgeText = 'Clicked';
            break;
          case 'credential_attempt':
            type = 'danger';
            title = 'Credential Compromise';
            badgeText = 'Compromised';
            break;
        }

        return {
          type,
          title,
          meta: `${evt.employeeEmail || 'Unknown'} · ${evt.campaignName || 'Unknown Campaign'}`,
          time: evt.timestamp,
          badgeText
        };
      }).sort((a, b) => b.time - a.time);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
