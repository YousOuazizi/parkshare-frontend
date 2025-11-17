export interface AnalyticsEvent {
  eventType: string;
  eventData?: Record<string, any>;
  page?: string;
  referrer?: string;
}

export interface UserStatistics {
  userId: string;
  totalBookings: number;
  totalSpent: number;
  totalParking: number;
  totalEarned: number;
  favoriteLocations: Array<{
    parkingId: string;
    parkingTitle: string;
    bookingCount: number;
  }>;
  bookingsByMonth: Array<{
    month: string;
    count: number;
    amount: number;
  }>;
  averageBookingDuration: number;
  averageBookingValue: number;
}

export interface ParkingStatistics {
  parkingId: string;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
  viewCount: number;
  conversionRate: number;
  bookingsByMonth: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  revenueByDayOfWeek: Array<{
    dayOfWeek: number;
    revenue: number;
  }>;
  peakHours: Array<{
    hour: number;
    bookingCount: number;
  }>;
}

export interface AdminDashboard {
  overview: {
    totalUsers: number;
    totalParkings: number;
    totalBookings: number;
    totalRevenue: number;
    activeUsers: number;
    activeParkings: number;
  };
  growth: {
    userGrowth: Array<{
      month: string;
      count: number;
    }>;
    parkingGrowth: Array<{
      month: string;
      count: number;
    }>;
    revenueGrowth: Array<{
      month: string;
      amount: number;
    }>;
  };
  topParkings: Array<{
    parkingId: string;
    title: string;
    bookingCount: number;
    revenue: number;
  }>;
  topUsers: Array<{
    userId: string;
    name: string;
    bookingCount: number;
    totalSpent: number;
  }>;
  verificationStats: {
    level0: number;
    level1: number;
    level2: number;
    level3: number;
    level4: number;
  };
}
