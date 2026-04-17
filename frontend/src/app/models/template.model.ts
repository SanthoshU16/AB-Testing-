import { Timestamp } from 'firebase/firestore';

export type TemplateCategory =
  | 'password-reset'
  | 'login-alert'
  | 'hr-policy'
  | 'delivery'
  | 'vpn'
  | 'custom';

export interface PhishingTemplate {
  id?: string;
  name: string;
  category: TemplateCategory;
  subject: string;
  senderName: string;
  senderEmail: string;
  bodyHtml: string;
  previewText?: string;
  isDefault: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
