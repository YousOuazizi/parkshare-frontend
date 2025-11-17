export enum ReviewType {
  PARKING = 'PARKING',
  USER = 'USER'
}

export interface ReviewCriteria {
  location?: number;
  cleanliness?: number;
  security?: number;
  accuracy?: number;
  value?: number;
  communication?: number;
}

export interface Review {
  id: string;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  targetParkingId?: string;
  targetParking?: {
    id: string;
    title: string;
  };
  targetUserId?: string;
  targetUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  bookingId?: string;
  type: ReviewType;
  rating: number;
  criteria: ReviewCriteria;
  comment?: string;
  response?: string;
  responseDate?: string;
  isReported: boolean;
  reportReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  targetParkingId?: string;
  targetUserId?: string;
  bookingId?: string;
  type: ReviewType;
  rating: number;
  criteria: ReviewCriteria;
  comment?: string;
}

export interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
  averageCriteria: ReviewCriteria;
}

export interface ReviewSearchParams {
  parkingId?: string;
  targetUserId?: string;
  authorId?: string;
  type?: ReviewType;
  minRating?: number;
  page?: number;
  limit?: number;
}
