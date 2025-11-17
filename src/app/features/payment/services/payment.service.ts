import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Payment, CreatePaymentRequest, PaymentIntent, RefundRequest } from '../../../core/models';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private api = inject(ApiService);
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublishableKey);
  }

  /**
   * Get Stripe instance
   */
  getStripe(): Promise<Stripe | null> {
    return this.stripePromise;
  }

  /**
   * Create payment intent
   */
  createPayment(data: CreatePaymentRequest): Observable<PaymentIntent> {
    return this.api.post<PaymentIntent>(API_ENDPOINTS.PAYMENTS.BASE, data);
  }

  /**
   * Get user payments
   */
  getPayments(): Observable<Payment[]> {
    return this.api.get<Payment[]>(API_ENDPOINTS.PAYMENTS.BASE);
  }

  /**
   * Get all payments (admin)
   */
  getAllPayments(): Observable<Payment[]> {
    return this.api.get<Payment[]>(API_ENDPOINTS.PAYMENTS.ADMIN);
  }

  /**
   * Get payment by ID
   */
  getPaymentById(id: string): Observable<Payment> {
    return this.api.get<Payment>(API_ENDPOINTS.PAYMENTS.BY_ID(id));
  }

  /**
   * Get payments by booking
   */
  getPaymentsByBooking(bookingId: string): Observable<Payment[]> {
    return this.api.get<Payment[]>(API_ENDPOINTS.PAYMENTS.BY_BOOKING(bookingId));
  }

  /**
   * Request refund (admin)
   */
  refundPayment(data: RefundRequest): Observable<Payment> {
    return this.api.post<Payment>(API_ENDPOINTS.PAYMENTS.REFUND, data);
  }
}
