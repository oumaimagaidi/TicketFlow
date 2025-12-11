export type TicketCategory = 'Technical' | 'Financial' | 'Product';
export type TicketStatus = 'New' | 'Under Review' | 'Resolved';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface StatusHistory {
  status: TicketStatus;
  changedAt: string;
  changedBy: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  attachment?: string;
  attachmentName?: string;
  attachment_url?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  statusHistory: StatusHistory[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  re_password: string;
  role?: UserRole;
}