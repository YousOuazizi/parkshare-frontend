export enum AccessMethod {
  CODE = 'CODE',
  KEY = 'KEY',
  REMOTE = 'REMOTE',
  APP = 'APP',
  NONE = 'NONE'
}

export interface ParkingSize {
  length: number;
  width: number;
  height: number;
}

export interface ParkingPhoto {
  url: string;
  caption?: string;
  order: number;
}

export interface AvailabilitySchedule {
  dayOfWeek: number; // 0-6 (0 = Sunday)
  startTime: string; // HH:mm format
  endTime: string;
  isAvailable: boolean;
}

export interface AvailabilityException {
  date: string; // ISO date
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
  reason?: string;
}

export interface Parking {
  id: string;
  userId: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    verificationLevel: string;
  };
  title: string;
  description: string;
  address: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
  basePrice: number;
  currency: string;
  accessMethod: AccessMethod;
  accessInstructions?: string;
  isActive: boolean;
  isVerified: boolean;
  hasEVCharging: boolean;
  size: ParkingSize;
  features: string[];
  photos: ParkingPhoto[];
  availabilitySchedules: AvailabilitySchedule[];
  availabilityExceptions: AvailabilityException[];
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  totalReviews?: number;
  distance?: number; // For search results
}

export interface ParkingSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  hasEVCharging?: boolean;
  features?: string[];
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateParkingRequest {
  title: string;
  description: string;
  address: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
  basePrice: number;
  currency: string;
  accessMethod: AccessMethod;
  accessInstructions?: string;
  hasEVCharging: boolean;
  size: ParkingSize;
  features: string[];
  availabilitySchedules: AvailabilitySchedule[];
}
