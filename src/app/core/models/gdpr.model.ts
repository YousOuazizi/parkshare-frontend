export enum ConsentType {
  TERMS_AND_CONDITIONS = 'TERMS_AND_CONDITIONS',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  MARKETING_EMAILS = 'MARKETING_EMAILS',
  ANALYTICS = 'ANALYTICS',
  THIRD_PARTY_SHARING = 'THIRD_PARTY_SHARING',
  GEOLOCATION = 'GEOLOCATION',
  PUSH_NOTIFICATIONS = 'PUSH_NOTIFICATIONS'
}

export enum DataExportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

export enum DataDeletionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Consent {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  grantedAt?: string;
  withdrawnAt?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  status: DataExportStatus;
  downloadUrl?: string;
  expiresAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  reason?: string;
  status: DataDeletionStatus;
  rejectionReason?: string;
  scheduledFor?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentUpdate {
  consentType: ConsentType;
  granted: boolean;
}
