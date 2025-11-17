export enum NotificationType {
  BOOKING_CREATED = 'BOOKING_CREATED',
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_CANCELED = 'BOOKING_CANCELED',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  BOOKING_COMPLETED = 'BOOKING_COMPLETED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  SWAP_OFFER_RECEIVED = 'SWAP_OFFER_RECEIVED',
  SWAP_OFFER_ACCEPTED = 'SWAP_OFFER_ACCEPTED',
  SWAP_OFFER_REJECTED = 'SWAP_OFFER_REJECTED',
  SUBSCRIPTION_EXPIRING = 'SUBSCRIPTION_EXPIRING',
  SUBSCRIPTION_RENEWED = 'SUBSCRIPTION_RENEWED',
  VERIFICATION_APPROVED = 'VERIFICATION_APPROVED',
  VERIFICATION_REJECTED = 'VERIFICATION_REJECTED',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: {
    bookings: boolean;
    payments: boolean;
    reviews: boolean;
    swaps: boolean;
    subscriptions: boolean;
    marketing: boolean;
  };
  push: {
    bookings: boolean;
    payments: boolean;
    reviews: boolean;
    swaps: boolean;
    messages: boolean;
  };
  sms: {
    bookingReminders: boolean;
    importantUpdates: boolean;
  };
}
