import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  AnalyticsEvent,
  UserStatistics,
  ParkingStatistics,
  AdminDashboard
} from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private api = inject(ApiService);

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.ANALYTICS.TRACK, event);
  }

  /**
   * Get admin dashboard stats
   */
  getAdminDashboard(): Observable<AdminDashboard> {
    return this.api.get<AdminDashboard>(API_ENDPOINTS.ANALYTICS.DASHBOARD);
  }

  /**
   * Get user statistics
   */
  getUserStatistics(): Observable<UserStatistics> {
    return this.api.get<UserStatistics>(API_ENDPOINTS.ANALYTICS.USER);
  }

  /**
   * Get parking statistics
   */
  getParkingStatistics(parkingId: string): Observable<ParkingStatistics> {
    return this.api.get<ParkingStatistics>(API_ENDPOINTS.ANALYTICS.PARKING(parkingId));
  }

  /**
   * Track page view
   */
  trackPageView(page: string): void {
    this.trackEvent({
      eventType: 'page_view',
      page,
      eventData: {
        timestamp: new Date().toISOString()
      }
    }).subscribe();
  }

  /**
   * Track click
   */
  trackClick(element: string, data?: any): void {
    this.trackEvent({
      eventType: 'click',
      eventData: {
        element,
        ...data,
        timestamp: new Date().toISOString()
      }
    }).subscribe();
  }
}
