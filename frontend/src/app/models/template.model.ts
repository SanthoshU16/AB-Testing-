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
  createdAt?: number;
  updatedAt?: number;
  // Landing page customization
  landingBrand?: string;        // e.g. "LinkedIn", "Google", "Dropbox"
  landingLogoUrl?: string;      // URL to brand logo image
  landingPrimaryColor?: string; // Button/accent color, e.g. "#0a66c2"
  landingBgColor?: string;      // Page background color, e.g. "#f3f2ef"
}
