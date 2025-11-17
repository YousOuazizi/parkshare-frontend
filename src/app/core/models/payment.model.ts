export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELED = 'CANCELED'
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL'
}

export interface Payment {
  id: string;
  userId: string;
  bookingId: string;
  booking?: {
    id: string;
    parking: {
      title: string;
    };
  };
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  stripePaymentIntentId?: string;
  stripePaymentMethodId?: string;
  refundedAmount?: number;
  refundedAt?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  bookingId: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason?: string;
}
