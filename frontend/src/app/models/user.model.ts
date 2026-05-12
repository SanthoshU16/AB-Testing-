export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'viewer';
  companyName?: string;
  departmentName?: string;
  photoURL?: string;
  createdAt?: any;
  lastLogin?: any;
}
