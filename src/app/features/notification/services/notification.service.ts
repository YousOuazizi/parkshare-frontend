import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Notification } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private api = inject(ApiService);

  // Signals for reactive state
  private unreadCountSignal = signal<number>(0);
  unreadCount = this.unreadCountSignal.asReadonly();

  /**
   * Get all notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.api.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.BASE);
  }

  /**
   * Get unread count
   */
  getUnreadCount(): Observable<{ count: number }> {
    return this.api.get<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.COUNT).pipe(
      tap(response => this.unreadCountSignal.set(response.count))
    );
  }

  /**
   * Get notification by ID
   */
  getNotificationById(id: string): Observable<Notification> {
    return this.api.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): Observable<Notification> {
    return this.api.patch<Notification>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {}).pipe(
      tap(() => {
        const current = this.unreadCountSignal();
        if (current > 0) {
          this.unreadCountSignal.set(current - 1);
        }
      })
    );
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, {}).pipe(
      tap(() => this.unreadCountSignal.set(0))
    );
  }

  /**
   * Delete notification
   */
  deleteNotification(id: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
  }

  /**
   * Refresh unread count
   */
  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}
