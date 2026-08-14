// User and Auth Types
export type UserRole = "staff" | "visitor";

export interface User {
  id: string;
  name: string;
  phone?: string;
  company?: string;
  role: UserRole;
  email?: string;
}

// Property Types
export interface Property {
  id: string;
  address: string;
  description?: string;
  createdAt: Date;
}

// Key Status Types
export type KeyStatus = "available" | "checked_out" | "overdue";

export interface Key {
  id: string;
  propertyId: string;
  status: KeyStatus;
  currentHolder?: User;
  checkedOutAt?: Date;
  expectedReturnAt?: Date;
  reason?: string;
  signature?: string;
  checkedOutBy?: User; // Staff who initiated checkout
  createdAt: Date;
}

// Checkout/Checkin Event Types
export interface KeyCheckoutEvent {
  id: string;
  keyId: string;
  propertyId: string;
  holder: User;
  checkedOutAt: Date;
  expectedReturnAt: Date;
  reason: string;
  signature?: string;
  checkedOutBy?: User;
}

export interface KeyCheckinEvent {
  id: string;
  keyId: string;
  propertyId: string;
  checkedInAt: Date;
  checkedInBy?: User;
  notes?: string;
}

// Activity Timeline Types
export type ActivityType =
  | "key_checked_out"
  | "key_checked_in"
  | "key_marked_overdue"
  | "key_reminder_sent";

export interface Activity {
  id: string;
  propertyId: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
