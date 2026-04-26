import { Timestamp } from 'firebase/firestore';

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed';

export interface CampaignStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  credentialAttempts: number;
}

export interface Campaign {
  id?: string;
  name: string;
  description?: string;
  templateId: string;
  templateName: string;
  targetDepartments: string[];
  targetEmployeeIds: string[];
  status: CampaignStatus;
  scheduledAt?: number | null;
  sentAt?: number | null;
  completedAt?: number | null;
  createdBy: string;
  createdAt: number;
  stats?: CampaignStats | null;
}
