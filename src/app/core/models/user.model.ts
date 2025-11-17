export enum UserRole {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

export enum VerificationLevel {
  LEVEL_0 = 'LEVEL_0',
  LEVEL_1 = 'LEVEL_1',
  LEVEL_2 = 'LEVEL_2',
  LEVEL_3 = 'LEVEL_3',
  LEVEL_4 = 'LEVEL_4'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  verificationLevel: VerificationLevel;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdentityVerified: boolean;
  isAdvancedVerified: boolean;
  profilePicture?: string;
  bio?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface VerificationRequirement {
  level: VerificationLevel;
  name: string;
  description: string;
  requirements: string[];
  benefits: string[];
  limits: {
    maxActiveBookings?: number;
    maxPaymentAmount?: number;
    maxParkings?: number;
  };
}
