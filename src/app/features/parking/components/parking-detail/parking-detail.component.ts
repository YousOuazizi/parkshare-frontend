import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, of } from 'rxjs';

import { ParkingService } from '../../services/parking.service';
import { ReviewService } from '../../../review/services/review.service';
import { Parking, Review, ReviewType } from '../../../../core/models';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-parking-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatExpansionModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  templateUrl: './parking-detail.component.html',
  styleUrls: ['./parking-detail.component.scss']
})
export class ParkingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private parkingService = inject(ParkingService);
  private reviewService = inject(ReviewService);

  // State signals
  parking = signal<Parking | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selectedPhotoIndex = signal(0);
  dateRange = signal<DateRange>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000) // +1 day
  });

  // Computed signals
  totalPrice = computed(() => {
    const parking = this.parking();
    const range = this.dateRange();
    if (!parking || !range.startDate || !range.endDate) return 0;

    const hours = Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60));
    return parking.basePrice * hours;
  });

  serviceFee = computed(() => Math.round(this.totalPrice() * 0.15)); // 15% service fee

  grandTotal = computed(() => this.totalPrice() + this.serviceFee());

  averageRating = computed(() => this.parking()?.averageRating || 0);

  totalReviews = computed(() => this.parking()?.totalReviews || 0);

  selectedPhoto = computed(() => {
    const photos = this.parking()?.photos || [];
    const index = this.selectedPhotoIndex();
    return photos[index] || null;
  });

  hasMultiplePhotos = computed(() => (this.parking()?.photos.length || 0) > 1);

  // Days of week for availability display
  daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  ngOnInit(): void {
    const parkingId = this.route.snapshot.paramMap.get('id');
    if (!parkingId) {
      this.error.set('Parking ID not provided');
      this.loading.set(false);
      return;
    }

    this.loadParkingDetails(parkingId);
    this.loadReviews(parkingId);
  }

  private loadParkingDetails(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.parkingService.getParkingById(id).pipe(
      catchError(err => {
        console.error('Error loading parking:', err);
        this.error.set('Failed to load parking details. Please try again later.');
        this.loading.set(false);
        return of(null);
      })
    ).subscribe(parking => {
      if (parking) {
        this.parking.set(parking);
      }
      this.loading.set(false);
    });
  }

  private loadReviews(parkingId: string): void {
    this.reviewService.getReviews({
      parkingId,
      type: ReviewType.PARKING,
      limit: 10
    }).pipe(
      catchError(err => {
        console.error('Error loading reviews:', err);
        return of([]);
      })
    ).subscribe(reviews => {
      this.reviews.set(reviews);
    });
  }

  navigateToBooking(): void {
    const parking = this.parking();
    if (!parking) return;

    const range = this.dateRange();
    this.router.navigate(['/bookings/create'], {
      queryParams: {
        parkingId: parking.id,
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString()
      }
    });
  }

  selectPhoto(index: number): void {
    this.selectedPhotoIndex.set(index);
  }

  previousPhoto(): void {
    const photos = this.parking()?.photos || [];
    const currentIndex = this.selectedPhotoIndex();
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    this.selectedPhotoIndex.set(newIndex);
  }

  nextPhoto(): void {
    const photos = this.parking()?.photos || [];
    const currentIndex = this.selectedPhotoIndex();
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    this.selectedPhotoIndex.set(newIndex);
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < Math.round(rating));
  }

  getAvailabilityForDay(dayOfWeek: number): string {
    const parking = this.parking();
    if (!parking) return 'Not available';

    const schedule = parking.availabilitySchedules.find(s => s.dayOfWeek === dayOfWeek);
    if (!schedule || !schedule.isAvailable) return 'Not available';

    return `${schedule.startTime} - ${schedule.endTime}`;
  }

  getAccessMethodIcon(method: string): string {
    const icons: { [key: string]: string } = {
      'CODE': 'pin',
      'KEY': 'vpn_key',
      'REMOTE': 'phonelink',
      'APP': 'smartphone',
      'NONE': 'no_encryption'
    };
    return icons[method] || 'help';
  }

  getAccessMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'CODE': 'Access Code',
      'KEY': 'Physical Key',
      'REMOTE': 'Remote Control',
      'APP': 'Mobile App',
      'NONE': 'No Access Control'
    };
    return labels[method] || method;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getReviewerName(review: Review): string {
    if (!review.author) return 'Anonymous';
    return `${review.author.firstName} ${review.author.lastName}`;
  }

  getReviewerInitials(review: Review): string {
    if (!review.author) return 'A';
    return `${review.author.firstName.charAt(0)}${review.author.lastName.charAt(0)}`;
  }

  navigateToOwnerProfile(): void {
    const parking = this.parking();
    if (!parking?.owner) return;
    this.router.navigate(['/users', parking.owner.id]);
  }

  shareParking(): void {
    const parking = this.parking();
    if (!parking) return;

    if (navigator.share) {
      navigator.share({
        title: parking.title,
        text: parking.description,
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  reportParking(): void {
    const parking = this.parking();
    if (!parking) return;
    // TODO: Implement report functionality
    alert('Report functionality coming soon!');
  }
}
