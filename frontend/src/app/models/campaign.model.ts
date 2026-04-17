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
  scheduledAt?: Timestamp | null;
  sentAt?: Timestamp | null;
  completedAt?: Timestamp | null;
  createdBy: string;
  createdAt: Timestamp;
  stats: CampaignStats;
}
