import { Timestamp } from 'firebase/firestore';

export type TrackingEventType =
  | 'email_delivered'
  | 'email_opened'
  | 'link_clicked'
  | 'credential_attempt';

export interface TrackingEvent {
  id?: string;
  campaignId: string;
  campaignName?: string;
  employeeId: string;
  employeeEmail: string;
  employeeName?: string;
  department?: string;
  eventType: TrackingEventType;
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
  /** Never true with password stored — only "attempt detected" flag */
  credentialAttempted: boolean;
}
