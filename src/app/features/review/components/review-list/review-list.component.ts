import { Component, OnInit, signal, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ReviewService } from '../../services/review.service';
import { Review, ReviewSearchParams, ReviewStatistics, ReviewType } from '../../../../core/models';

interface FilterForm {
  minRating: FormControl<number | null>;
  sortBy: FormControl<string | null>;
}

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatTooltipModule
  ],
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.scss']
})
export class ReviewListComponent implements OnInit {
  private reviewService = inject(ReviewService);

  // Input for parking or user ID
  parkingId = input<string>();
  userId = input<string>();

  // Signals for reactive state
  reviews = signal<Review[]>([]);
  statistics = signal<ReviewStatistics | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Pagination signals
  totalItems = signal<number>(0);
  pageSize = signal<number>(10);
  pageIndex = signal<number>(0);

  // Computed signal for paginated reviews
  displayedReviews = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.reviews().slice(start, end);
  });

  // Computed signal for average rating
  averageRating = computed(() => {
    const stats = this.statistics();
    return stats ? stats.averageRating : 0;
  });

  // Computed signal for rating distribution
  ratingDistribution = computed(() => {
    const stats = this.statistics();
    if (!stats) return [];

    return [5, 4, 3, 2, 1].map(rating => ({
      rating,
      count: stats.ratingDistribution[rating] || 0,
      percentage: stats.totalReviews > 0
        ? ((stats.ratingDistribution[rating] || 0) / stats.totalReviews) * 100
        : 0
    }));
  });

  // Filter form
  filterForm = new FormGroup<FilterForm>({
    minRating: new FormControl<number | null>(null),
    sortBy: new FormControl<string>('date:DESC')
  });

  // Rating filter options
  ratingOptions = [
    { value: null, label: 'All Ratings' },
    { value: 5, label: '5 Stars' },
    { value: 4, label: '4+ Stars' },
    { value: 3, label: '3+ Stars' },
    { value: 2, label: '2+ Stars' },
    { value: 1, label: '1+ Stars' }
  ];

  // Sort options
  sortOptions = [
    { value: 'date:DESC', label: 'Most Recent' },
    { value: 'date:ASC', label: 'Oldest First' },
    { value: 'rating:DESC', label: 'Highest Rating' },
    { value: 'rating:ASC', label: 'Lowest Rating' }
  ];

  ngOnInit(): void {
    this.loadReviews();
    this.loadStatistics();
    this.setupFilterListeners();
  }

  /**
   * Load reviews from API
   */
  loadReviews(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = this.buildSearchParams();

    this.reviewService.getReviews(params).subscribe({
      next: (data) => {
        this.reviews.set(data);
        this.totalItems.set(data.length);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load reviews. Please try again.');
        this.loading.set(false);
        console.error('Error loading reviews:', err);
      }
    });
  }

  /**
   * Load review statistics
   */
  loadStatistics(): void {
    const parkingId = this.parkingId();
    const userId = this.userId();

    if (parkingId) {
      this.reviewService.getParkingStats(parkingId).subscribe({
        next: (stats) => {
          this.statistics.set(stats);
        },
        error: (err) => {
          console.error('Error loading statistics:', err);
        }
      });
    } else if (userId) {
      this.reviewService.getUserStats(userId).subscribe({
        next: (stats) => {
          this.statistics.set(stats);
        },
        error: (err) => {
          console.error('Error loading statistics:', err);
        }
      });
    }
  }

  /**
   * Build search parameters from filters
   */
  private buildSearchParams(): ReviewSearchParams {
    const formValue = this.filterForm.value;
    const [sortBy, sortOrder] = (formValue.sortBy || 'date:DESC').split(':');

    const params: ReviewSearchParams = {
      page: 1,
      limit: 100 // Load all for client-side pagination
    };

    if (this.parkingId()) {
      params.parkingId = this.parkingId();
      params.type = ReviewType.PARKING;
    }

    if (this.userId()) {
      params.targetUserId = this.userId();
    }

    if (formValue.minRating !== null && formValue.minRating > 0) {
      params.minRating = formValue.minRating;
    }

    return params;
  }

  /**
   * Setup filter form listeners with debounce
   */
  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetPagination();
        this.loadReviews();
      });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Reset pagination to first page
   */
  private resetPagination(): void {
    this.pageIndex.set(0);
  }

  /**
   * Filter by rating
   */
  filterByRating(rating: number): void {
    this.filterForm.patchValue({ minRating: rating });
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      minRating: null,
      sortBy: 'date:DESC'
    });
    this.resetPagination();
  }

  /**
   * Get rating stars array
   */
  getRatingStars(rating: number): boolean[] {
    const stars: boolean[] = [];
    const ratingValue = Math.round(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(i <= ratingValue);
    }

    return stars;
  }

  /**
   * Get half stars for partial ratings
   */
  getStarType(index: number, rating: number): 'full' | 'half' | 'empty' {
    const roundedRating = Math.floor(rating);
    const hasHalf = rating - roundedRating >= 0.5;

    if (index < roundedRating) {
      return 'full';
    } else if (index === roundedRating && hasHalf) {
      return 'half';
    } else {
      return 'empty';
    }
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  /**
   * Get reviewer name
   */
  getReviewerName(review: Review): string {
    if (review.author) {
      return `${review.author.firstName} ${review.author.lastName}`;
    }
    return 'Anonymous';
  }

  /**
   * Get reviewer initials
   */
  getReviewerInitials(review: Review): string {
    if (review.author) {
      const firstInitial = review.author.firstName?.charAt(0) || '';
      const lastInitial = review.author.lastName?.charAt(0) || '';
      return `${firstInitial}${lastInitial}`.toUpperCase();
    }
    return 'AN';
  }

  /**
   * Get reviewer avatar URL
   */
  getReviewerAvatar(review: Review): string | null {
    return review.author?.profilePicture || null;
  }

  /**
   * Get criteria label
   */
  getCriteriaLabel(key: string): string {
    const labels: { [key: string]: string } = {
      location: 'Location',
      cleanliness: 'Cleanliness',
      security: 'Security',
      accuracy: 'Accuracy',
      value: 'Value',
      communication: 'Communication'
    };
    return labels[key] || key;
  }

  /**
   * Get criteria entries
   */
  getCriteriaEntries(review: Review): Array<{ key: string; value: number }> {
    return Object.entries(review.criteria)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => ({ key, value: value as number }));
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByReviewId(index: number, review: Review): string {
    return review.id;
  }
}
