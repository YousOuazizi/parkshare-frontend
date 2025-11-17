export enum DocumentType {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  DRIVER_LICENSE = 'DRIVER_LICENSE',
  ADDRESS_PROOF = 'ADDRESS_PROOF',
  SELFIE = 'SELFIE'
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface VerificationDocument {
  id: string;
  userId: string;
  type: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  rejectionReason?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface VerificationInfo {
  userId: string;
  verificationLevel: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  isAdvancedVerified: boolean;
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  identityVerifiedAt?: string;
  advancedVerifiedAt?: string;
  documents: VerificationDocument[];
  nextLevel?: {
    level: string;
    requirements: string[];
  };
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationConfirm {
  token: string;
}

export interface PhoneVerificationRequest {
  phoneNumber: string;
}

export interface PhoneVerificationConfirm {
  phoneNumber: string;
  code: string;
}

export interface DocumentUploadRequest {
  type: DocumentType;
  file: File;
}
