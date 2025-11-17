import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';

import { SwapService } from '../../services/swap.service';
import { ParkingService } from '../../../parking/services/parking.service';
import { Parking } from '../../../../core/models/parking.model';
import { CreateSwapListingRequest } from '../../../../core/models/swap.model';

@Component({
  selector: 'app-swap-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  templateUrl: './swap-create.component.html',
  styleUrls: ['./swap-create.component.scss']
})
export class SwapCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private swapService = inject(SwapService);
  private parkingService = inject(ParkingService);

  // Signals for reactive state
  myParkings = signal<Parking[]>([]);
  loading = signal<boolean>(false);
  submitting = signal<boolean>(false);
  error = signal<string | null>(null);

  // Forms
  parkingForm!: FormGroup;
  datesForm!: FormGroup;
  preferencesForm!: FormGroup;

  // Min date for date pickers
  minDate = new Date();

  ngOnInit(): void {
    this.initializeForms();
    this.loadMyParkings();
  }

  /**
   * Initialize all forms
   */
  private initializeForms(): void {
    // Parking Selection Form
    this.parkingForm = this.fb.group({
      parkingId: ['', Validators.required],
      subscriptionId: ['']
    });

    // Dates Form
    this.datesForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      allowPartialDays: [false]
    });

    // Preferences Form
    this.preferencesForm = this.fb.group({
      description: ['', [Validators.maxLength(500)]],
      requiresExchange: [true],
      price: [null, [Validators.min(0)]],
      currency: ['USD'],
      preferredLatitude: [null],
      preferredLongitude: [null],
      preferredRadius: [null, [Validators.min(0)]]
    });
  }

  /**
   * Load user's parkings
   */
  loadMyParkings(): void {
    this.loading.set(true);
    this.error.set(null);

    // Note: In a real implementation, you'd have a method to get user's parkings
    // For now, we'll use searchParkings as a placeholder
    this.parkingService.getAllParkings().subscribe({
      next: (data) => {
        this.myParkings.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load your parkings. Please try again.');
        this.loading.set(false);
        console.error('Error loading parkings:', err);
      }
    });
  }

  /**
   * Submit the swap listing
   */
  onSubmit(): void {
    if (!this.parkingForm.valid || !this.datesForm.valid) {
      this.markFormsAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const formData = this.buildCreateRequest();

    this.swapService.createListing(formData).subscribe({
      next: (listing) => {
        this.submitting.set(false);
        // Navigate to swap listings or detail page
        this.router.navigate(['/swap']);
      },
      error: (err) => {
        this.error.set('Failed to create swap listing. Please try again.');
        this.submitting.set(false);
        console.error('Error creating swap listing:', err);
      }
    });
  }

  /**
   * Build create listing request from forms
   */
  private buildCreateRequest(): CreateSwapListingRequest {
    const parking = this.parkingForm.value;
    const dates = this.datesForm.value;
    const prefs = this.preferencesForm.value;

    const request: CreateSwapListingRequest = {
      parkingId: parking.parkingId,
      startDate: this.formatDate(dates.startDate),
      endDate: this.formatDate(dates.endDate),
      requiresExchange: prefs.requiresExchange,
      allowPartialDays: dates.allowPartialDays
    };

    if (parking.subscriptionId) {
      request.subscriptionId = parking.subscriptionId;
    }

    if (prefs.description) {
      request.description = prefs.description;
    }

    if (prefs.price && prefs.price > 0) {
      request.price = prefs.price;
      request.currency = prefs.currency;
    }

    if (prefs.preferredLatitude && prefs.preferredLongitude && prefs.preferredRadius) {
      request.preferredLocation = {
        latitude: prefs.preferredLatitude,
        longitude: prefs.preferredLongitude,
        radius: prefs.preferredRadius
      };
    }

    return request;
  }

  /**
   * Format date to ISO string
   */
  private formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Mark all forms as touched to show validation errors
   */
  private markFormsAsTouched(): void {
    this.parkingForm.markAllAsTouched();
    this.datesForm.markAllAsTouched();
    this.preferencesForm.markAllAsTouched();
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/swap']);
  }

  /**
   * Get parking photo URL
   */
  getParkingPhotoUrl(parking: Parking): string {
    if (parking.photos && parking.photos.length > 0) {
      return parking.photos[0].url;
    }
    return 'assets/images/default-parking.jpg';
  }

  /**
   * Get selected parking details
   */
  getSelectedParking(): Parking | undefined {
    const parkingId = this.parkingForm.get('parkingId')?.value;
    return this.myParkings().find(p => p.id === parkingId);
  }

  /**
   * Toggle exchange requirement
   */
  onExchangeToggle(value: boolean): void {
    const priceControl = this.preferencesForm.get('price');
    if (value) {
      // If requires exchange, price is optional
      priceControl?.clearValidators();
    } else {
      // If cash only, price is required
      priceControl?.setValidators([Validators.required, Validators.min(1)]);
    }
    priceControl?.updateValueAndValidity();
  }

  /**
   * Validate dates
   */
  validateDates(): boolean {
    const startDate = this.datesForm.get('startDate')?.value;
    const endDate = this.datesForm.get('endDate')?.value;

    if (startDate && endDate) {
      return new Date(endDate) > new Date(startDate);
    }
    return true;
  }

  /**
   * Get formatted address for parking
   */
  getFormattedAddress(parking: Parking): string {
    const parts = [parking.address];
    if (parking.city) parts.push(parking.city);
    if (parking.country) parts.push(parking.country);
    return parts.join(', ');
  }
}
