export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'viewer';
  createdAt: Date;
  lastLogin: Date;
}
