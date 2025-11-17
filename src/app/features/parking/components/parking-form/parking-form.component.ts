import { Component, OnInit, signal, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ParkingService } from '../../services/parking.service';
import { AccessMethod, CreateParkingRequest, Parking, AvailabilitySchedule } from '../../../../core/models';

interface PhotoPreview {
  file: File;
  url: string;
  order: number;
}

interface DaySchedule {
  day: string;
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-parking-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './parking-form.component.html',
  styleUrls: ['./parking-form.component.scss']
})
export class ParkingFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private parkingService = inject(ParkingService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Input for edit mode
  parkingId = input<string>();

  // Signals for state management
  isLoading = signal(false);
  isSaving = signal(false);
  isEditMode = computed(() => !!this.parkingId());
  photosPreviews = signal<PhotoPreview[]>([]);
  selectedFeatures = signal<string[]>([]);

  // Form groups for each step
  basicInfoForm!: FormGroup;
  locationForm!: FormGroup;
  pricingForm!: FormGroup;
  photosForm!: FormGroup;
  availabilityForm!: FormGroup;

  // Access methods enum for template
  accessMethods = Object.values(AccessMethod);

  // Available features
  availableFeatures = [
    'Covered',
    'Security Camera',
    'Well Lit',
    'Easy Access',
    'Reserved',
    'Valet Available',
    'Handicap Accessible',
    '24/7 Access',
    'Indoor',
    'Outdoor',
    'Gated',
    'Monitored'
  ];

  // Currency options
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  // Days of the week for availability
  weekDays: DaySchedule[] = [
    { day: 'Sunday', dayOfWeek: 0, enabled: true, startTime: '00:00', endTime: '23:59' },
    { day: 'Monday', dayOfWeek: 1, enabled: true, startTime: '00:00', endTime: '23:59' },
    { day: 'Tuesday', dayOfWeek: 2, enabled: true, startTime: '00:00', endTime: '23:59' },
    { day: 'Wednesday', dayOfWeek: 3, enabled: true, startTime: '00:00', endTime: '23:59' },
    { day: 'Thursday', dayOfWeek: 4, enabled: true, startTime: '00:00', endTime: '23:59' },
    { day: 'Friday', dayOfWeek: 5, enabled: true, startTime: '00:00', endTime: '23:59' },
    { day: 'Saturday', dayOfWeek: 6, enabled: true, startTime: '00:00', endTime: '23:59' }
  ];

  ngOnInit(): void {
    this.initializeForms();

    if (this.isEditMode()) {
      this.loadParkingData();
    }
  }

  private initializeForms(): void {
    // Step 1: Basic Information
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      accessMethod: [AccessMethod.CODE, Validators.required],
      accessInstructions: ['', Validators.maxLength(500)]
    });

    // Step 2: Location
    this.locationForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]]
    });

    // Step 3: Pricing & Size
    this.pricingForm = this.fb.group({
      basePrice: [null, [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      hasEVCharging: [false],
      size: this.fb.group({
        length: [null, [Validators.required, Validators.min(1)]],
        width: [null, [Validators.required, Validators.min(1)]],
        height: [null, [Validators.required, Validators.min(1)]]
      })
    });

    // Step 4: Photos (handled separately with file uploads)
    this.photosForm = this.fb.group({
      // Photos will be handled via signal
    });

    // Step 5: Availability
    this.availabilityForm = this.fb.group({
      schedules: this.fb.array([])
    });
  }

  private loadParkingData(): void {
    const id = this.parkingId();
    if (!id) return;

    this.isLoading.set(true);
    this.parkingService.getParkingById(id).subscribe({
      next: (parking) => {
        this.populateFormWithData(parking);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading parking:', error);
        this.snackBar.open('Failed to load parking data', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  private populateFormWithData(parking: Parking): void {
    // Basic Info
    this.basicInfoForm.patchValue({
      title: parking.title,
      description: parking.description,
      accessMethod: parking.accessMethod,
      accessInstructions: parking.accessInstructions
    });

    // Location
    this.locationForm.patchValue({
      address: parking.address,
      city: parking.city,
      country: parking.country,
      latitude: parking.latitude,
      longitude: parking.longitude
    });

    // Pricing
    this.pricingForm.patchValue({
      basePrice: parking.basePrice,
      currency: parking.currency,
      hasEVCharging: parking.hasEVCharging,
      size: parking.size
    });

    // Features
    this.selectedFeatures.set(parking.features);

    // Availability schedules
    if (parking.availabilitySchedules?.length > 0) {
      parking.availabilitySchedules.forEach(schedule => {
        const daySchedule = this.weekDays.find(d => d.dayOfWeek === schedule.dayOfWeek);
        if (daySchedule) {
          daySchedule.enabled = schedule.isAvailable;
          daySchedule.startTime = schedule.startTime;
          daySchedule.endTime = schedule.endTime;
        }
      });
    }
  }

  // Photo upload handling
  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const currentPreviews = this.photosPreviews();

    files.forEach((file, index) => {
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
          url: e.target?.result as string,
          order: currentPreviews.length + index
        };
        this.photosPreviews.update(previews => [...previews, preview]);
      };
      reader.readAsDataURL(file);
    });

    // Clear input
    input.value = '';
  }

  removePhoto(index: number): void {
    this.photosPreviews.update(previews => {
      const updated = previews.filter((_, i) => i !== index);
      // Reorder remaining photos
      return updated.map((p, i) => ({ ...p, order: i }));
    });
  }

  movePhotoUp(index: number): void {
    if (index === 0) return;
    this.photosPreviews.update(previews => {
      const updated = [...previews];
      [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
      return updated.map((p, i) => ({ ...p, order: i }));
    });
  }

  movePhotoDown(index: number): void {
    const previews = this.photosPreviews();
    if (index === previews.length - 1) return;
    this.photosPreviews.update(previews => {
      const updated = [...previews];
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
      return updated.map((p, i) => ({ ...p, order: i }));
    });
  }

  // Feature selection
  toggleFeature(feature: string): void {
    this.selectedFeatures.update(features => {
      if (features.includes(feature)) {
        return features.filter(f => f !== feature);
      } else {
        return [...features, feature];
      }
    });
  }

  isFeatureSelected(feature: string): boolean {
    return this.selectedFeatures().includes(feature);
  }

  // Location autocomplete placeholder
  searchAddress(query: string): void {
    // TODO: Implement Google Places API autocomplete
    // This is a placeholder for future integration
    console.log('Searching for address:', query);
    this.snackBar.open('Address autocomplete will be integrated with Google Places API', 'Close', {
      duration: 2000
    });
  }

  // Use current location
  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.snackBar.open('Geolocation is not supported by your browser', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.locationForm.patchValue({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        this.isLoading.set(false);
        this.snackBar.open('Location captured successfully', 'Close', { duration: 2000 });
      },
      (error) => {
        console.error('Error getting location:', error);
        this.snackBar.open('Failed to get current location', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    );
  }

  // Availability schedule methods
  toggleDayAvailability(day: DaySchedule): void {
    day.enabled = !day.enabled;
  }

  // Form submission
  async onSubmit(): Promise<void> {
    // Validate all forms
    if (!this.isFormValid()) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving.set(true);

    try {
      // Prepare the request data
      const parkingData = this.prepareParkingData();

      let result: Parking;
      if (this.isEditMode()) {
        result = await this.updateParking(parkingData);
      } else {
        result = await this.createParking(parkingData);
      }

      // Upload photos if any
      if (this.photosPreviews().length > 0 && result.id) {
        await this.uploadPhotos(result.id);
      }

      this.snackBar.open(
        `Parking ${this.isEditMode() ? 'updated' : 'created'} successfully!`,
        'Close',
        { duration: 3000 }
      );

      // Navigate to parking details or list
      this.router.navigate(['/parking', result.id]);
    } catch (error) {
      console.error('Error saving parking:', error);
      this.snackBar.open(
        `Failed to ${this.isEditMode() ? 'update' : 'create'} parking`,
        'Close',
        { duration: 3000 }
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  private isFormValid(): boolean {
    return (
      this.basicInfoForm.valid &&
      this.locationForm.valid &&
      this.pricingForm.valid &&
      this.weekDays.some(day => day.enabled)
    );
  }

  private prepareParkingData(): CreateParkingRequest {
    const basicInfo = this.basicInfoForm.value;
    const location = this.locationForm.value;
    const pricing = this.pricingForm.value;

    // Prepare availability schedules
    const availabilitySchedules: AvailabilitySchedule[] = this.weekDays
      .map(day => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        isAvailable: day.enabled
      }));

    return {
      title: basicInfo.title,
      description: basicInfo.description,
      address: location.address,
      city: location.city,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      basePrice: pricing.basePrice,
      currency: pricing.currency,
      accessMethod: basicInfo.accessMethod,
      accessInstructions: basicInfo.accessInstructions,
      hasEVCharging: pricing.hasEVCharging,
      size: pricing.size,
      features: this.selectedFeatures(),
      availabilitySchedules
    };
  }

  private async createParking(data: CreateParkingRequest): Promise<Parking> {
    return new Promise((resolve, reject) => {
      this.parkingService.createParking(data).subscribe({
        next: resolve,
        error: reject
      });
    });
  }

  private async updateParking(data: CreateParkingRequest): Promise<Parking> {
    const id = this.parkingId();
    if (!id) throw new Error('Parking ID is required for update');

    return new Promise((resolve, reject) => {
      this.parkingService.updateParking(id, data).subscribe({
        next: resolve,
        error: reject
      });
    });
  }

  private async uploadPhotos(parkingId: string): Promise<void> {
    const photos = this.photosPreviews();
    const uploadPromises = photos.map(photo =>
      new Promise((resolve, reject) => {
        this.parkingService.uploadPhoto(parkingId, photo.file).subscribe({
          next: resolve,
          error: reject
        });
      })
    );

    await Promise.all(uploadPromises);
  }

  // Cancel and go back
  onCancel(): void {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      this.router.navigate(['/parking']);
    }
  }
}
