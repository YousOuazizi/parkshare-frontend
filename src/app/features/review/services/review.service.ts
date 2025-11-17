import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Review, CreateReviewRequest, ReviewSearchParams, ReviewStatistics } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private api = inject(ApiService);

  /**
   * Create review
   */
  createReview(data: CreateReviewRequest): Observable<Review> {
    return this.api.post<Review>(API_ENDPOINTS.REVIEWS.BASE, data);
  }

  /**
   * Get reviews with filters
   */
  getReviews(params?: ReviewSearchParams): Observable<Review[]> {
    return this.api.get<Review[]>(API_ENDPOINTS.REVIEWS.BASE, params);
  }

  /**
   * Get review by ID
   */
  getReviewById(id: string): Observable<Review> {
    return this.api.get<Review>(API_ENDPOINTS.REVIEWS.BY_ID(id));
  }

  /**
   * Update review
   */
  updateReview(id: string, data: Partial<CreateReviewRequest>): Observable<Review> {
    return this.api.patch<Review>(API_ENDPOINTS.REVIEWS.BY_ID(id), data);
  }

  /**
   * Reply to review (owner)
   */
  replyToReview(id: string, response: string): Observable<Review> {
    return this.api.patch<Review>(API_ENDPOINTS.REVIEWS.REPLY(id), { response });
  }

  /**
   * Report review
   */
  reportReview(id: string, reason: string): Observable<Review> {
    return this.api.patch<Review>(API_ENDPOINTS.REVIEWS.REPORT(id), { reason });
  }

  /**
   * Delete review
   */
  deleteReview(id: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.REVIEWS.BY_ID(id));
  }

  /**
   * Get parking review statistics
   */
  getParkingStats(parkingId: string): Observable<ReviewStatistics> {
    return this.api.get<ReviewStatistics>(API_ENDPOINTS.REVIEWS.STATS_PARKING(parkingId));
  }

  /**
   * Get user review statistics
   */
  getUserStats(userId: string): Observable<ReviewStatistics> {
    return this.api.get<ReviewStatistics>(API_ENDPOINTS.REVIEWS.STATS_USER(userId));
  }
}
