import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SwapService } from '../../services/swap.service';
import { SwapListing, SwapListingStatus } from '../../../../core/models/swap.model';

interface FilterForm {
  searchQuery: FormControl<string | null>;
  status: FormControl<SwapListingStatus | null>;
  requiresExchange: FormControl<boolean | null>;
  minPrice: FormControl<number | null>;
  maxPrice: FormControl<number | null>;
}

@Component({
  selector: 'app-swap-listings',
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
    MatProgressSpinnerModule
  ],
  templateUrl: './swap-listings.component.html',
  styleUrls: ['./swap-listings.component.scss']
})
export class SwapListingsComponent implements OnInit {
  private swapService = inject(SwapService);

  // Signals for reactive state
  listings = signal<SwapListing[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Computed signal for filtered listings
  filteredListings = computed(() => {
    const allListings = this.listings();
    const filters = this.filterForm.value;

    return allListings.filter(listing => {
      // Status filter
      if (filters.status && listing.status !== filters.status) {
        return false;
      }

      // Requires exchange filter
      if (filters.requiresExchange !== null && listing.requiresExchange !== filters.requiresExchange) {
        return false;
      }

      // Price filters
      if (filters.minPrice !== null && listing.price && listing.price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== null && listing.price && listing.price > filters.maxPrice) {
        return false;
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = listing.parking?.title?.toLowerCase().includes(query);
        const matchesAddress = listing.parking?.address?.toLowerCase().includes(query);
        const matchesDescription = listing.description?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesAddress && !matchesDescription) {
          return false;
        }
      }

      return true;
    });
  });

  // Filter form
  filterForm = new FormGroup<FilterForm>({
    searchQuery: new FormControl<string>(''),
    status: new FormControl<SwapListingStatus | null>(null),
    requiresExchange: new FormControl<boolean | null>(null),
    minPrice: new FormControl<number | null>(null),
    maxPrice: new FormControl<number | null>(null)
  });

  // Status options
  statusOptions = [
    { value: SwapListingStatus.ACTIVE, label: 'Active' },
    { value: SwapListingStatus.BOOKED, label: 'Booked' },
    { value: SwapListingStatus.COMPLETED, label: 'Completed' },
    { value: SwapListingStatus.CANCELLED, label: 'Cancelled' },
    { value: SwapListingStatus.EXPIRED, label: 'Expired' }
  ];

  // Exchange options
  exchangeOptions = [
    { value: true, label: 'Requires Exchange' },
    { value: false, label: 'Cash Only' }
  ];

  ngOnInit(): void {
    this.loadListings();
    this.setupFilterListeners();
  }

  /**
   * Load swap listings from API
   */
  loadListings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.swapService.getListings().subscribe({
      next: (data) => {
        this.listings.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load swap listings. Please try again.');
        this.loading.set(false);
        console.error('Error loading swap listings:', err);
      }
    });
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
        // Filters are automatically applied via computed signal
      });
  }

  /**
   * Reset all filters
   */
  resetFilters(): void {
    this.filterForm.reset({
      searchQuery: '',
      status: null,
      requiresExchange: null,
      minPrice: null,
      maxPrice: null
    });
  }

  /**
   * Get primary photo URL for parking
   */
  getPrimaryPhotoUrl(listing: SwapListing): string {
    if (listing.parking?.photos && listing.parking.photos.length > 0) {
      return listing.parking.photos[0].url;
    }
    return 'assets/images/default-parking.jpg';
  }

  /**
   * Get status chip color
   */
  getStatusColor(status: SwapListingStatus): string {
    switch (status) {
      case SwapListingStatus.ACTIVE:
        return 'primary';
      case SwapListingStatus.BOOKED:
        return 'accent';
      case SwapListingStatus.COMPLETED:
        return 'success';
      case SwapListingStatus.CANCELLED:
        return 'warn';
      case SwapListingStatus.EXPIRED:
        return 'default';
      default:
        return 'default';
    }
  }

  /**
   * Get status chip class
   */
  getStatusClass(status: SwapListingStatus): string {
    switch (status) {
      case SwapListingStatus.ACTIVE:
        return 'status-active';
      case SwapListingStatus.BOOKED:
        return 'status-booked';
      case SwapListingStatus.COMPLETED:
        return 'status-completed';
      case SwapListingStatus.CANCELLED:
        return 'status-cancelled';
      case SwapListingStatus.EXPIRED:
        return 'status-expired';
      default:
        return '';
    }
  }

  /**
   * Format price with currency
   */
  formatPrice(price: number | undefined, currency: string | undefined): string {
    if (!price) return 'Negotiable';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }

  /**
   * Format date range
   */
  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr}`;
  }

  /**
   * Get preferred location text
   */
  getPreferredLocationText(listing: SwapListing): string {
    if (!listing.preferredLocation) {
      return 'Any location';
    }

    const radiusMiles = (listing.preferredLocation.radius / 1609.34).toFixed(1);
    return `Within ${radiusMiles} miles`;
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByListingId(index: number, listing: SwapListing): string {
    return listing.id;
  }
}
