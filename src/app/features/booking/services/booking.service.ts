import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Booking, CreateBookingRequest, BookingSearchParams, BookingStatistics, BookingStatus } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private api = inject(ApiService);

  /**
   * Create booking
   */
  createBooking(data: CreateBookingRequest): Observable<Booking> {
    return this.api.post<Booking>(API_ENDPOINTS.BOOKINGS.BASE, data);
  }

  /**
   * Get bookings with filters
   */
  getBookings(params?: BookingSearchParams): Observable<Booking[]> {
    return this.api.get<Booking[]>(API_ENDPOINTS.BOOKINGS.BASE, params);
  }

  /**
   * Get booking by ID
   */
  getBookingById(id: string): Observable<Booking> {
    return this.api.get<Booking>(API_ENDPOINTS.BOOKINGS.BY_ID(id));
  }

  /**
   * Update booking
   */
  updateBooking(id: string, data: Partial<CreateBookingRequest>): Observable<Booking> {
    return this.api.patch<Booking>(API_ENDPOINTS.BOOKINGS.BY_ID(id), data);
  }

  /**
   * Update booking status
   */
  updateBookingStatus(id: string, status: BookingStatus): Observable<Booking> {
    return this.api.patch<Booking>(
      API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id),
      {},
      { params: { status } }
    );
  }

  /**
   * Cancel booking
   */
  cancelBooking(id: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.BOOKINGS.BY_ID(id));
  }

  /**
   * Check-in
   */
  checkIn(id: string): Observable<Booking> {
    return this.api.post<Booking>(API_ENDPOINTS.BOOKINGS.CHECK_IN(id), {});
  }

  /**
   * Check-out
   */
  checkOut(id: string): Observable<Booking> {
    return this.api.post<Booking>(API_ENDPOINTS.BOOKINGS.CHECK_OUT(id), {});
  }

  /**
   * Get access code
   */
  getAccessCode(id: string): Observable<{ accessCode: string }> {
    return this.api.post<{ accessCode: string }>(API_ENDPOINTS.BOOKINGS.ACCESS_CODE(id), {});
  }

  /**
   * Get user booking statistics
   */
  getUserStats(): Observable<BookingStatistics> {
    return this.api.get<BookingStatistics>(API_ENDPOINTS.BOOKINGS.STATS_USER);
  }

  /**
   * Get parking booking statistics
   */
  getParkingStats(parkingId: string): Observable<BookingStatistics> {
    return this.api.get<BookingStatistics>(API_ENDPOINTS.BOOKINGS.STATS_PARKING(parkingId));
  }
}
