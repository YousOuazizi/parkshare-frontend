export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export interface AppliedPriceRule {
  ruleId: string;
  name: string;
  type: string;
  adjustment: number;
  amount: number;
}

export interface Booking {
  id: string;
  userId: string;
  parkingId: string;
  parking?: {
    id: string;
    title: string;
    address: string;
    photos: Array<{ url: string }>;
    owner: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startTime: string;
  endTime: string;
  status: BookingStatus;
  totalPrice: number;
  currency: string;
  paymentId?: string;
  accessCode?: string;
  checkedIn: boolean;
  checkedInTime?: string;
  checkedOut: boolean;
  checkedOutTime?: string;
  appliedPriceRules: AppliedPriceRule[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  parkingId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface BookingSearchParams {
  userId?: string;
  parkingId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BookingStatistics {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  canceledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  bookingsByMonth: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
}
