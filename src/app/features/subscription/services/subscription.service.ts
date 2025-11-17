import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  SubscriptionPlan,
  Subscription,
  CreateSubscriptionRequest,
  SubscriptionUsageReport
} from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private api = inject(ApiService);

  // Subscription Plans
  getPlans(): Observable<SubscriptionPlan[]> {
    return this.api.get<SubscriptionPlan[]>(API_ENDPOINTS.SUBSCRIPTION_PLANS.BASE);
  }

  getPlanById(id: string): Observable<SubscriptionPlan> {
    return this.api.get<SubscriptionPlan>(API_ENDPOINTS.SUBSCRIPTION_PLANS.BY_ID(id));
  }

  // Subscriptions
  createSubscription(data: CreateSubscriptionRequest): Observable<Subscription> {
    return this.api.post<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.BASE, data);
  }

  getSubscriptions(): Observable<Subscription[]> {
    return this.api.get<Subscription[]>(API_ENDPOINTS.SUBSCRIPTIONS.BASE);
  }

  getSubscriptionById(id: string): Observable<Subscription> {
    return this.api.get<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id));
  }

  updateSubscription(id: string, data: Partial<CreateSubscriptionRequest>): Observable<Subscription> {
    return this.api.patch<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.BY_ID(id), data);
  }

  cancelSubscription(id: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL(id), {});
  }

  pauseSubscription(id: string): Observable<Subscription> {
    return this.api.post<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.PAUSE(id), {});
  }

  resumeSubscription(id: string): Observable<Subscription> {
    return this.api.post<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.RESUME(id), {});
  }

  shareSubscription(id: string, email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.SUBSCRIPTIONS.SHARE(id), { email });
  }

  acceptShare(shareId: string): Observable<Subscription> {
    return this.api.post<Subscription>(API_ENDPOINTS.SUBSCRIPTIONS.ACCEPT_SHARE(shareId), {});
  }

  rejectShare(shareId: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.SUBSCRIPTIONS.REJECT_SHARE(shareId), {});
  }

  revokeShare(shareId: string): Observable<void> {
    return this.api.post<void>(API_ENDPOINTS.SUBSCRIPTIONS.REVOKE_SHARE(shareId), {});
  }

  getUsageReport(id: string): Observable<SubscriptionUsageReport> {
    return this.api.get<SubscriptionUsageReport>(API_ENDPOINTS.SUBSCRIPTIONS.USAGE(id));
  }

  checkAccess(parkingId: string): Observable<{ hasAccess: boolean; subscription?: Subscription }> {
    return this.api.get<{ hasAccess: boolean; subscription?: Subscription }>(
      API_ENDPOINTS.SUBSCRIPTIONS.CHECK_ACCESS(parkingId)
    );
  }
}
