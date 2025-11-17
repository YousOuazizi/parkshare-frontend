export enum SubscriptionType {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM'
}

export enum RecurrencePattern {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKDAY = 'WEEKDAY',
  WEEKEND = 'WEEKEND',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  type: SubscriptionType;
  price: number;
  currency: string;
  durationHours?: number;
  recurrencePattern: RecurrencePattern;
  maxShares: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan?: SubscriptionPlan;
  parkingId: string;
  parking?: {
    id: string;
    title: string;
    address: string;
    photos: Array<{ url: string }>;
  };
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  sharedWith: string[];
  sharedUsers?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionRequest {
  planId: string;
  parkingId: string;
  startDate: string;
  autoRenew?: boolean;
}

export interface SubscriptionUsageReport {
  subscriptionId: string;
  period: {
    start: string;
    end: string;
  };
  totalUsage: number;
  usageByDay: Array<{
    date: string;
    count: number;
    hours: number;
  }>;
  sharedUserUsage: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
}
