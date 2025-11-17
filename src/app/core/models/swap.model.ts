export enum SwapListingStatus {
  ACTIVE = 'ACTIVE',
  BOOKED = 'BOOKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum SwapOfferStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export interface PreferredLocation {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface SwapListing {
  id: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  parkingId: string;
  parking?: {
    id: string;
    title: string;
    address: string;
    latitude: number;
    longitude: number;
    photos: Array<{ url: string }>;
  };
  subscriptionId?: string;
  startDate: string;
  endDate: string;
  description?: string;
  price?: number;
  currency?: string;
  requiresExchange: boolean;
  preferredLocation?: PreferredLocation;
  allowPartialDays: boolean;
  status: SwapListingStatus;
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

export interface SwapOffer {
  id: string;
  listingId: string;
  listing?: SwapListing;
  offererId: string;
  offerer?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  offeredParkingId?: string;
  offeredParking?: {
    id: string;
    title: string;
    address: string;
    photos: Array<{ url: string }>;
  };
  startDate: string;
  endDate: string;
  message?: string;
  offeredPrice?: number;
  status: SwapOfferStatus;
  responseMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SwapTransaction {
  id: string;
  listingId: string;
  offerId: string;
  listingOwnerId: string;
  offererId: string;
  completedAt?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSwapListingRequest {
  parkingId: string;
  subscriptionId?: string;
  startDate: string;
  endDate: string;
  description?: string;
  price?: number;
  currency?: string;
  requiresExchange: boolean;
  preferredLocation?: PreferredLocation;
  allowPartialDays: boolean;
}

export interface CreateSwapOfferRequest {
  listingId: string;
  offeredParkingId?: string;
  startDate: string;
  endDate: string;
  message?: string;
  offeredPrice?: number;
}
