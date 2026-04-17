import { Timestamp } from 'firebase/firestore';

export interface Employee {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role?: string;
  status: 'active' | 'inactive';
  riskScore?: number;
  lastPhishingTestDate?: Timestamp | null;
  createdAt?: Timestamp;
}
