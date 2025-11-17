import { Component, OnInit, signal, computed, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ReviewService } from '../../services/review.service';
import { CreateReviewRequest, Review, ReviewType } from '../../../../core/models';

interface PhotoPreview {
  file: File;
  url: string;
}

@Component({
  selector: 'app-review-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './review-create.component.html',
  styleUrls: ['./review-create.component.scss']
})
export class ReviewCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reviewService = inject(ReviewService);
  private snackBar = inject(MatSnackBar);

  // Inputs
  parkingId = input<string>();
  userId = input<string>();
  bookingId = input<string>();
  reviewType = input<ReviewType>(ReviewType.PARKING);

  // Output event for successful review creation
  reviewCreated = output<Review>();

  // Signals for state management
  isSubmitting = signal(false);
  photosPreviews = signal<PhotoPreview[]>([]);
  overallRating = signal<number>(0);
  criteriaRatings = signal<{
    cleanliness: number;
    location: number;
    value: number;
  }>({
    cleanliness: 0,
    location: 0,
    value: 0
  });

  // Computed signal for form validity
  isFormValid = computed(() => {
    return this.reviewForm.valid && this.overallRating() > 0;
  });

  // Computed signal for character count
  commentLength = computed(() => {
    const comment = this.reviewForm.get('comment')?.value || '';
    return comment.length;
  });

  // Review form
  reviewForm!: FormGroup;

  // Character limits
  readonly MAX_COMMENT_LENGTH = 1000;
  readonly MIN_COMMENT_LENGTH = 10;

  // Rating labels
  ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.reviewForm = this.fb.group({
      comment: [
        '',
        [
          Validators.required,
          Validators.minLength(this.MIN_COMMENT_LENGTH),
          Validators.maxLength(this.MAX_COMMENT_LENGTH)
        ]
      ]
    });
  }

  /**
   * Set overall rating
   */
  setOverallRating(rating: number): void {
    this.overallRating.set(rating);
  }

  /**
   * Set criteria rating
   */
  setCriteriaRating(criterion: 'cleanliness' | 'location' | 'value', rating: number): void {
    this.criteriaRatings.update(ratings => ({
      ...ratings,
      [criterion]: rating
    }));
  }

  /**
   * Get star array for rating display
   */
  getStarArray(rating: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  /**
   * Check if star is filled
   */
  isStarFilled(starIndex: number, rating: number): boolean {
    return starIndex <= rating;
  }

  /**
   * Get rating label
   */
  getRatingLabel(rating: number): string {
    if (rating === 0) return 'Not rated';
    return this.ratingLabels[rating - 1];
  }

  /**
   * Handle photo selection
   */
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const currentPreviews = this.photosPreviews();

    // Limit to 5 photos
    if (currentPreviews.length + files.length > 5) {
      this.snackBar.open('You can upload a maximum of 5 photos', 'Close', { duration: 3000 });
      return;
    }

    files.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Only image files are allowed', 'Close', { duration: 3000 });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size must be less than 5MB', 'Close', { duration: 3000 });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const preview: PhotoPreview = {
          file,
          url: e.target?.result as string
        };
        this.photosPreviews.update(previews => [...previews, preview]);
      };
      reader.readAsDataURL(file);
    });

    // Clear input
    input.value = '';
  }

  /**
   * Remove photo
   */
  removePhoto(index: number): void {
    this.photosPreviews.update(previews => previews.filter((_, i) => i !== index));
  }

  /**
   * Submit review
   */
  async onSubmit(): Promise<void> {
    // Validate form
    if (!this.isFormValid()) {
      if (this.overallRating() === 0) {
        this.snackBar.open('Please select an overall rating', 'Close', { duration: 3000 });
      } else {
        this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      }
      return;
    }

    this.isSubmitting.set(true);

    try {
      // Prepare review data
      const reviewData = this.prepareReviewData();

      // Create review
      const review = await this.createReview(reviewData);

      // Upload photos if any
      if (this.photosPreviews().length > 0) {
        // Note: Photo upload functionality would need to be added to ReviewService
        // For now, we'll skip this as it's not in the current service implementation
        console.log('Photo upload not yet implemented in ReviewService');
      }

      this.snackBar.open('Review submitted successfully!', 'Close', { duration: 3000 });

      // Emit review created event
      this.reviewCreated.emit(review);

      // Reset form
      this.resetForm();
    } catch (error) {
      console.error('Error submitting review:', error);
      this.snackBar.open('Failed to submit review. Please try again.', 'Close', { duration: 3000 });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Prepare review data
   */
  private prepareReviewData(): CreateReviewRequest {
    const formValue = this.reviewForm.value;
    const ratings = this.criteriaRatings();

    const reviewData: CreateReviewRequest = {
      type: this.reviewType(),
      rating: this.overallRating(),
      criteria: {
        cleanliness: ratings.cleanliness || undefined,
        location: ratings.location || undefined,
        value: ratings.value || undefined
      },
      comment: formValue.comment
    };

    // Add parking ID if provided
    if (this.parkingId()) {
      reviewData.targetParkingId = this.parkingId();
    }

    // Add user ID if provided
    if (this.userId()) {
      reviewData.targetUserId = this.userId();
    }

    // Add booking ID if provided
    if (this.bookingId()) {
      reviewData.bookingId = this.bookingId();
    }

    return reviewData;
  }

  /**
   * Create review via service
   */
  private async createReview(data: CreateReviewRequest): Promise<Review> {
    return new Promise((resolve, reject) => {
      this.reviewService.createReview(data).subscribe({
        next: resolve,
        error: reject
      });
    });
  }

  /**
   * Reset form to initial state
   */
  resetForm(): void {
    this.reviewForm.reset();
    this.overallRating.set(0);
    this.criteriaRatings.set({
      cleanliness: 0,
      location: 0,
      value: 0
    });
    this.photosPreviews.set([]);
  }

  /**
   * Cancel review
   */
  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
        this.resetForm();
      }
    } else {
      this.resetForm();
    }
  }

  /**
   * Check if there are unsaved changes
   */
  private hasUnsavedChanges(): boolean {
    return (
      this.overallRating() > 0 ||
      this.criteriaRatings().cleanliness > 0 ||
      this.criteriaRatings().location > 0 ||
      this.criteriaRatings().value > 0 ||
      (this.reviewForm.get('comment')?.value || '').length > 0 ||
      this.photosPreviews().length > 0
    );
  }

  /**
   * Get character count color
   */
  getCharacterCountColor(): string {
    const length = this.commentLength();
    const percentage = (length / this.MAX_COMMENT_LENGTH) * 100;

    if (percentage >= 90) {
      return 'warn';
    } else if (percentage >= 75) {
      return 'accent';
    } else {
      return 'primary';
    }
  }

  /**
   * Check if character limit is near
   */
  isCharacterLimitNear(): boolean {
    const percentage = (this.commentLength() / this.MAX_COMMENT_LENGTH) * 100;
    return percentage >= 75;
  }
}
