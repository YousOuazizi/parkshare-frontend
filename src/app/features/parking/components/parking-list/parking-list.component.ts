import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ParkingService } from '../../services/parking.service';
import { Parking, ParkingSearchParams } from '../../../../core/models/parking.model';

interface FilterForm {
  searchQuery: FormControl<string | null>;
  minPrice: FormControl<number | null>;
  maxPrice: FormControl<number | null>;
  hasEVCharging: FormControl<boolean | null>;
  isVerified: FormControl<boolean | null>;
  features: FormControl<string[] | null>;
}

@Component({
  selector: 'app-parking-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    MatSliderModule
  ],
  templateUrl: './parking-list.component.html',
  styleUrls: ['./parking-list.component.scss']
})
export class ParkingListComponent implements OnInit {
  private parkingService = inject(ParkingService);

  // Signals for reactive state
  parkings = signal<Parking[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  viewMode = signal<'grid' | 'map'>('grid');

  // Pagination signals
  totalItems = signal<number>(0);
  pageSize = signal<number>(12);
  pageIndex = signal<number>(0);

  // Computed signal for paginated parkings
  displayedParkings = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.parkings().slice(start, end);
  });

  // Filter form
  filterForm = new FormGroup<FilterForm>({
    searchQuery: new FormControl<string>(''),
    minPrice: new FormControl<number>(0),
    maxPrice: new FormControl<number>(200),
    hasEVCharging: new FormControl<boolean | null>(null),
    isVerified: new FormControl<boolean | null>(null),
    features: new FormControl<string[]>([])
  });

  // Available features for filtering
  availableFeatures = [
    'Covered',
    'Security Camera',
    'Well Lit',
    'Gated',
    'EV Charging',
    '24/7 Access',
    'Wheelchair Accessible',
    'Valet Service'
  ];

  // Sort options
  sortOptions = [
    { value: 'price:ASC', label: 'Price: Low to High' },
    { value: 'price:DESC', label: 'Price: High to Low' },
    { value: 'rating:DESC', label: 'Rating: High to Low' },
    { value: 'distance:ASC', label: 'Distance: Nearest' }
  ];
  selectedSort = signal<string>('price:ASC');

  constructor() {
    // Effect to reload parkings when sort changes
    effect(() => {
      const sort = this.selectedSort();
      if (sort) {
        this.loadParkings();
      }
    });
  }

  ngOnInit(): void {
    this.loadParkings();
    this.setupFilterListeners();
  }

  /**
   * Load parkings from API
   */
  loadParkings(): void {
    this.loading.set(true);
    this.error.set(null);

    const params = this.buildSearchParams();

    this.parkingService.searchParkings(params).subscribe({
      next: (data) => {
        this.parkings.set(data);
        this.totalItems.set(data.length);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load parkings. Please try again.');
        this.loading.set(false);
        console.error('Error loading parkings:', err);
      }
    });
  }

  /**
   * Build search parameters from filters
   */
  private buildSearchParams(): ParkingSearchParams {
    const formValue = this.filterForm.value;
    const [sortBy, sortOrder] = (this.selectedSort() || 'price:ASC').split(':');

    const params: ParkingSearchParams = {
      sortBy: sortBy === 'price' ? 'basePrice' : sortBy,
      sortOrder: sortOrder as 'ASC' | 'DESC',
      page: 1,
      limit: 100 // Load all for client-side pagination
    };

    if (formValue.minPrice !== null && formValue.minPrice > 0) {
      params.minPrice = formValue.minPrice;
    }

    if (formValue.maxPrice !== null && formValue.maxPrice < 200) {
      params.maxPrice = formValue.maxPrice;
    }

    if (formValue.hasEVCharging !== null) {
      params.hasEVCharging = formValue.hasEVCharging;
    }

    if (formValue.isVerified !== null) {
      params.isVerified = formValue.isVerified;
    }

    if (formValue.features && formValue.features.length > 0) {
      params.features = formValue.features;
    }

    return params;
  }

  /**
   * Setup filter form listeners with debounce
   */
  private setupFilterListeners(): void {
    // Listen to search query changes
    this.filterForm.get('searchQuery')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetPagination();
        this.loadParkings();
      });

    // Listen to other filter changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.resetPagination();
        this.loadParkings();
      });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Reset pagination to first page
   */
  private resetPagination(): void {
    this.pageIndex.set(0);
  }

  /**
   * Toggle view mode between grid and map
   */
  toggleViewMode(mode: 'grid' | 'map'): void {
    this.viewMode.set(mode);
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      searchQuery: '',
      minPrice: 0,
      maxPrice: 200,
      hasEVCharging: null,
      isVerified: null,
      features: []
    });
    this.selectedSort.set('price:ASC');
    this.resetPagination();
  }

  /**
   * Get primary photo URL for parking
   */
  getPrimaryPhotoUrl(parking: Parking): string {
    if (parking.photos && parking.photos.length > 0) {
      const primaryPhoto = parking.photos.find(p => p.order === 0) || parking.photos[0];
      return primaryPhoto.url;
    }
    return 'assets/images/default-parking.jpg'; // Fallback image
  }

  /**
   * Get formatted address
   */
  getFormattedAddress(parking: Parking): string {
    const parts = [parking.address];
    if (parking.city) parts.push(parking.city);
    if (parking.country) parts.push(parking.country);
    return parts.join(', ');
  }

  /**
   * Get availability status text
   */
  getAvailabilityStatus(parking: Parking): string {
    if (!parking.isActive) return 'Inactive';

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Check availability schedule
    const todaySchedule = parking.availabilitySchedules.find(s => s.dayOfWeek === currentDay);

    if (todaySchedule && todaySchedule.isAvailable) {
      if (currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime) {
        return 'Available Now';
      } else {
        return `Available ${todaySchedule.startTime} - ${todaySchedule.endTime}`;
      }
    }

    return 'Check Availability';
  }

  /**
   * Check if parking is currently available
   */
  isCurrentlyAvailable(parking: Parking): boolean {
    if (!parking.isActive) return false;

    const status = this.getAvailabilityStatus(parking);
    return status === 'Available Now';
  }

  /**
   * Get rating stars array
   */
  getRatingStars(rating: number | undefined): boolean[] {
    const stars: boolean[] = [];
    const ratingValue = rating || 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.round(ratingValue));
    }

    return stars;
  }

  /**
   * Format price with currency
   */
  formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByParkingId(index: number, parking: Parking): string {
    return parking.id;
  }
}
