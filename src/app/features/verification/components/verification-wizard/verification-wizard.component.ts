import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { VerificationService } from '../../services/verification.service';
import { DocumentType, VerificationInfo } from '../../../../core/models/verification.model';

interface VerificationLevel {
  level: number;
  name: string;
  description: string;
  icon: string;
  requirements: string[];
  isCompleted: boolean;
}

@Component({
  selector: 'app-verification-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './verification-wizard.component.html',
  styleUrls: ['./verification-wizard.component.scss']
})
export class VerificationWizardComponent implements OnInit {
  verificationInfo = signal<VerificationInfo | null>(null);
  loading = signal(false);
  loadingStep = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Forms for each step
  emailForm: FormGroup;
  emailCodeForm: FormGroup;
  phoneForm: FormGroup;
  phoneCodeForm: FormGroup;
  identityForm: FormGroup;
  advancedForm: FormGroup;

  // State for each step
  emailSent = signal(false);
  phoneSent = signal(false);
  selectedIdentityFile = signal<File | null>(null);
  selectedAdvancedFile = signal<File | null>(null);

  verificationLevels = computed<VerificationLevel[]>(() => {
    const info = this.verificationInfo();
    return [
      {
        level: 0,
        name: 'Email Verification',
        description: 'Verify your email address',
        icon: 'email',
        requirements: ['Valid email address', 'Access to your email inbox'],
        isCompleted: info?.isEmailVerified || false
      },
      {
        level: 1,
        name: 'Phone Verification',
        description: 'Verify your phone number',
        icon: 'phone',
        requirements: ['Valid phone number', 'Ability to receive SMS'],
        isCompleted: info?.isPhoneVerified || false
      },
      {
        level: 2,
        name: 'Identity Verification',
        description: 'Upload identity documents',
        icon: 'badge',
        requirements: [
          'Government-issued ID (Passport, National ID, or Driver License)',
          'Clear photo showing all details',
          'Valid and not expired'
        ],
        isCompleted: info?.isIdentityVerified || false
      },
      {
        level: 3,
        name: 'Advanced Verification',
        description: 'Complete advanced verification',
        icon: 'verified_user',
        requirements: [
          'Selfie with ID document',
          'Address proof (utility bill or bank statement)',
          'Additional documents as requested'
        ],
        isCompleted: info?.isAdvancedVerified || false
      }
    ];
  });

  currentLevel = computed(() => {
    const info = this.verificationInfo();
    if (!info) return 0;

    if (!info.isEmailVerified) return 0;
    if (!info.isPhoneVerified) return 1;
    if (!info.isIdentityVerified) return 2;
    if (!info.isAdvancedVerified) return 3;
    return 4; // All completed
  });

  completionPercentage = computed(() => {
    const levels = this.verificationLevels();
    const completedCount = levels.filter(l => l.isCompleted).length;
    return Math.round((completedCount / levels.length) * 100);
  });

  constructor(
    private fb: FormBuilder,
    private verificationService: VerificationService
  ) {
    // Email verification form
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.emailCodeForm = this.fb.group({
      token: ['', [Validators.required]]
    });

    // Phone verification form
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]]
    });

    this.phoneCodeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]]
    });

    // Identity verification form
    this.identityForm = this.fb.group({
      documentType: ['', Validators.required]
    });

    // Advanced verification form
    this.advancedForm = this.fb.group({
      documentType: [DocumentType.SELFIE, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadVerificationInfo();
  }

  loadVerificationInfo(): void {
    this.loading.set(true);
    this.verificationService.getVerificationInfo().subscribe({
      next: (info) => {
        this.verificationInfo.set(info);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set('Failed to load verification info. Please refresh the page.');
      }
    });
  }

  // Email Verification Methods
  requestEmailVerification(): void {
    if (this.emailForm.invalid || this.loadingStep()) return;

    this.loadingStep.set(true);
    this.errorMessage.set(null);

    this.verificationService.requestEmailVerification(this.emailForm.value).subscribe({
      next: (response) => {
        this.loadingStep.set(false);
        this.emailSent.set(true);
        this.successMessage.set('Verification email sent! Please check your inbox.');
      },
      error: (error) => {
        this.loadingStep.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to send verification email.');
      }
    });
  }

  verifyEmail(): void {
    if (this.emailCodeForm.invalid || this.loadingStep()) return;

    this.loadingStep.set(true);
    this.errorMessage.set(null);

    this.verificationService.verifyEmail(this.emailCodeForm.value).subscribe({
      next: (response) => {
        this.loadingStep.set(false);
        this.successMessage.set('Email verified successfully!');
        this.loadVerificationInfo();
        this.emailSent.set(false);
        this.emailForm.reset();
        this.emailCodeForm.reset();
      },
      error: (error) => {
        this.loadingStep.set(false);
        this.errorMessage.set(error.error?.message || 'Invalid verification code.');
      }
    });
  }

  // Phone Verification Methods
  requestPhoneVerification(): void {
    if (this.phoneForm.invalid || this.loadingStep()) return;

    this.loadingStep.set(true);
    this.errorMessage.set(null);

    this.verificationService.requestPhoneVerification(this.phoneForm.value).subscribe({
      next: (response) => {
        this.loadingStep.set(false);
        this.phoneSent.set(true);
        this.successMessage.set('Verification code sent to your phone!');
      },
      error: (error) => {
        this.loadingStep.set(false);
        this.errorMessage.set(error.error?.message || 'Failed to send verification code.');
      }
    });
  }

  verifyPhone(): void {
    if (this.phoneCodeForm.invalid || this.loadingStep()) return;

    this.loadingStep.set(true);
    this.errorMessage.set(null);

    const phoneNumber = this.phoneForm.get('phoneNumber')?.value;
    const code = this.phoneCodeForm.get('code')?.value;

    this.verificationService.verifyPhone({ phoneNumber, code }).subscribe({
      next: (response) => {
        this.loadingStep.set(false);
        this.successMessage.set('Phone verified successfully!');
        this.loadVerificationInfo();
        this.phoneSent.set(false);
        this.phoneForm.reset();
        this.phoneCodeForm.reset();
      },
      error: (error) => {
        this.loadingStep.set(false);
        this.errorMessage.set(error.error?.message || 'Invalid verification code.');
      }
    });
  }

  // Identity Document Upload
  onIdentityFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedIdentityFile.set(input.files[0]);
      this.errorMessage.set(null);
    }
  }

  uploadIdentityDocument(): void {
    if (this.identityForm.invalid || !this.selectedIdentityFile() || this.loadingStep()) return;

    this.loadingStep.set(true);
    this.errorMessage.set(null);

    const documentType = this.identityForm.get('documentType')?.value;
    const file = this.selectedIdentityFile();

    if (file) {
      this.verificationService.uploadDocument(documentType, file).subscribe({
        next: (response) => {
          this.loadingStep.set(false);
          this.successMessage.set('Identity document uploaded successfully! It will be reviewed shortly.');
          this.loadVerificationInfo();
          this.selectedIdentityFile.set(null);
          this.identityForm.reset();
        },
        error: (error) => {
          this.loadingStep.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to upload document.');
        }
      });
    }
  }

  // Advanced Document Upload
  onAdvancedFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedAdvancedFile.set(input.files[0]);
      this.errorMessage.set(null);
    }
  }

  uploadAdvancedDocument(): void {
    if (this.advancedForm.invalid || !this.selectedAdvancedFile() || this.loadingStep()) return;

    this.loadingStep.set(true);
    this.errorMessage.set(null);

    const documentType = this.advancedForm.get('documentType')?.value;
    const file = this.selectedAdvancedFile();

    if (file) {
      this.verificationService.uploadDocument(documentType, file).subscribe({
        next: (response) => {
          this.loadingStep.set(false);
          this.successMessage.set('Advanced document uploaded successfully! It will be reviewed shortly.');
          this.loadVerificationInfo();
          this.selectedAdvancedFile.set(null);
          this.advancedForm.reset();
        },
        error: (error) => {
          this.loadingStep.set(false);
          this.errorMessage.set(error.error?.message || 'Failed to upload document.');
        }
      });
    }
  }

  getDocumentTypes(): { value: DocumentType; label: string }[] {
    return [
      { value: DocumentType.PASSPORT, label: 'Passport' },
      { value: DocumentType.NATIONAL_ID, label: 'National ID Card' },
      { value: DocumentType.DRIVER_LICENSE, label: 'Driver License' }
    ];
  }

  getAdvancedDocumentTypes(): { value: DocumentType; label: string }[] {
    return [
      { value: DocumentType.SELFIE, label: 'Selfie with ID' },
      { value: DocumentType.ADDRESS_PROOF, label: 'Address Proof' }
    ];
  }

  getLevelChipColor(level: VerificationLevel): string {
    if (level.isCompleted) return 'primary';
    if (level.level === this.currentLevel()) return 'accent';
    return '';
  }
}
