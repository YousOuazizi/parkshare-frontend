import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';

import { SwapService } from '../../services/swap.service';
import { SwapOffer, SwapOfferStatus } from '../../../../core/models/swap.model';

@Component({
  selector: 'app-swap-offers',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './swap-offers.component.html',
  styleUrls: ['./swap-offers.component.scss']
})
export class SwapOffersComponent implements OnInit {
  private swapService = inject(SwapService);
  private dialog = inject(MatDialog);

  // Signals for reactive state
  allOffers = signal<SwapOffer[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  processingOfferId = signal<string | null>(null);

  // Computed signals for filtering offers
  receivedOffers = computed(() => {
    // In a real implementation, you'd filter based on current user ID
    // For now, we'll assume offers where the listing belongs to the user are "received"
    return this.allOffers().filter(offer => {
      // This is a placeholder - you'd need to check if listing.userId === currentUserId
      return true; // Replace with actual logic
    });
  });

  sentOffers = computed(() => {
    // In a real implementation, you'd filter based on current user ID
    // For now, we'll assume offers where offererId === currentUserId are "sent"
    return this.allOffers().filter(offer => {
      // This is a placeholder - you'd need to check if offer.offererId === currentUserId
      return true; // Replace with actual logic
    });
  });

  // Selected tab index
  selectedTabIndex = signal<number>(0);

  ngOnInit(): void {
    this.loadOffers();
  }

  /**
   * Load all offers from API
   */
  loadOffers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.swapService.getOffers().subscribe({
      next: (data) => {
        this.allOffers.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load offers. Please try again.');
        this.loading.set(false);
        console.error('Error loading offers:', err);
      }
    });
  }

  /**
   * Accept an offer
   */
  acceptOffer(offer: SwapOffer): void {
    this.processingOfferId.set(offer.id);

    this.swapService.respondToOffer(offer.id, true).subscribe({
      next: (updatedOffer) => {
        // Update the offer in the list
        this.updateOfferInList(updatedOffer);
        this.processingOfferId.set(null);
      },
      error: (err) => {
        this.error.set('Failed to accept offer. Please try again.');
        this.processingOfferId.set(null);
        console.error('Error accepting offer:', err);
      }
    });
  }

  /**
   * Reject an offer
   */
  rejectOffer(offer: SwapOffer): void {
    this.processingOfferId.set(offer.id);

    this.swapService.respondToOffer(offer.id, false, 'Offer declined').subscribe({
      next: (updatedOffer) => {
        // Update the offer in the list
        this.updateOfferInList(updatedOffer);
        this.processingOfferId.set(null);
      },
      error: (err) => {
        this.error.set('Failed to reject offer. Please try again.');
        this.processingOfferId.set(null);
        console.error('Error rejecting offer:', err);
      }
    });
  }

  /**
   * Cancel an offer (for sent offers)
   */
  cancelOffer(offer: SwapOffer): void {
    this.processingOfferId.set(offer.id);

    this.swapService.cancelOffer(offer.id).subscribe({
      next: () => {
        // Remove the offer from the list or update its status
        const offers = this.allOffers();
        const updatedOffers = offers.filter(o => o.id !== offer.id);
        this.allOffers.set(updatedOffers);
        this.processingOfferId.set(null);
      },
      error: (err) => {
        this.error.set('Failed to cancel offer. Please try again.');
        this.processingOfferId.set(null);
        console.error('Error canceling offer:', err);
      }
    });
  }

  /**
   * Update offer in the list
   */
  private updateOfferInList(updatedOffer: SwapOffer): void {
    const offers = this.allOffers();
    const index = offers.findIndex(o => o.id === updatedOffer.id);
    if (index !== -1) {
      const newOffers = [...offers];
      newOffers[index] = updatedOffer;
      this.allOffers.set(newOffers);
    }
  }

  /**
   * Get status chip color
   */
  getStatusClass(status: SwapOfferStatus): string {
    switch (status) {
      case SwapOfferStatus.PENDING:
        return 'status-pending';
      case SwapOfferStatus.ACCEPTED:
        return 'status-accepted';
      case SwapOfferStatus.REJECTED:
        return 'status-rejected';
      case SwapOfferStatus.CANCELLED:
        return 'status-cancelled';
      case SwapOfferStatus.COMPLETED:
        return 'status-completed';
      default:
        return '';
    }
  }

  /**
   * Get primary photo URL for parking
   */
  getPrimaryPhotoUrl(photos?: Array<{ url: string }>): string {
    if (photos && photos.length > 0) {
      return photos[0].url;
    }
    return 'assets/images/default-parking.jpg';
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
   * Format price with currency
   */
  formatPrice(price: number | undefined): string {
    if (!price) return 'N/A';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  }

  /**
   * Check if offer can be accepted/rejected
   */
  canRespondToOffer(offer: SwapOffer): boolean {
    return offer.status === SwapOfferStatus.PENDING;
  }

  /**
   * Check if offer can be cancelled
   */
  canCancelOffer(offer: SwapOffer): boolean {
    return offer.status === SwapOfferStatus.PENDING;
  }

  /**
   * Check if currently processing this offer
   */
  isProcessing(offerId: string): boolean {
    return this.processingOfferId() === offerId;
  }

  /**
   * Track by function for ngFor optimization
   */
  trackByOfferId(index: number, offer: SwapOffer): string {
    return offer.id;
  }
}
