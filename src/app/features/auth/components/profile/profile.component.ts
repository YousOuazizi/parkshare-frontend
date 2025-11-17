import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/services/auth.service';
import { User, UserRole, VerificationLevel } from '../../../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Signals for reactive state
  currentUser = this.authService.currentUser;
  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);

  // Form groups
  personalInfoForm!: FormGroup;
  securityForm!: FormGroup;

  // Computed signals
  verificationProgress = computed(() => {
    const user = this.currentUser();
    if (!user) return 0;

    let completedSteps = 0;
    const totalSteps = 4;

    if (user.isEmailVerified) completedSteps++;
    if (user.isPhoneVerified) completedSteps++;
    if (user.isIdentityVerified) completedSteps++;
    if (user.isAdvancedVerified) completedSteps++;

    return (completedSteps / totalSteps) * 100;
  });

  verificationLevelInfo = computed(() => {
    const level = this.currentUser()?.verificationLevel || VerificationLevel.LEVEL_0;
    return this.getVerificationLevelDetails(level);
  });

  userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  });

  fullName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`;
  });

  roleDisplayName = computed(() => {
    const role = this.currentUser()?.role;
    switch (role) {
      case UserRole.ADMIN: return 'Administrator';
      case UserRole.OWNER: return 'Parking Owner';
      case UserRole.USER: return 'User';
      default: return 'Unknown';
    }
  });

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    const user = this.currentUser();

    this.personalInfoForm = this.fb.group({
      firstName: [user?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [user?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [{ value: user?.email || '', disabled: true }, [Validators.required, Validators.email]],
      phoneNumber: [user?.phoneNumber || '', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      bio: [user?.bio || '', [Validators.maxLength(500)]],
      address: [user?.address || ''],
      city: [user?.city || ''],
      country: [user?.country || ''],
      dateOfBirth: [user?.dateOfBirth || '']
    });

    this.securityForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Disable forms by default
    this.personalInfoForm.disable();
  }

  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleEditMode(): void {
    this.isEditMode.update(mode => !mode);

    if (this.isEditMode()) {
      this.personalInfoForm.enable();
      this.personalInfoForm.get('email')?.disable(); // Keep email disabled
    } else {
      this.personalInfoForm.disable();
      this.resetForm();
    }
  }

  savePersonalInfo(): void {
    if (this.personalInfoForm.valid && !this.isSaving()) {
      this.isSaving.set(true);

      // Simulate API call - replace with actual API service call
      setTimeout(() => {
        const updatedUser: User = {
          ...this.currentUser()!,
          ...this.personalInfoForm.getRawValue()
        };

        this.authService.updateCurrentUser(updatedUser);
        this.isSaving.set(false);
        this.isEditMode.set(false);
        this.personalInfoForm.disable();

        this.snackBar.open('Profile updated successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 1000);
    }
  }

  resetForm(): void {
    const user = this.currentUser();
    if (user) {
      this.personalInfoForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        address: user.address,
        city: user.city,
        country: user.country,
        dateOfBirth: user.dateOfBirth
      });
    }
  }

  changePassword(): void {
    if (this.securityForm.valid && !this.isSaving()) {
      this.isSaving.set(true);

      // Simulate API call - replace with actual API service call
      setTimeout(() => {
        this.isSaving.set(false);
        this.securityForm.reset();

        this.snackBar.open('Password changed successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      }, 1000);
    }
  }

  requestVerification(type: 'email' | 'phone' | 'identity' | 'advanced'): void {
    this.isLoading.set(true);

    // Simulate API call - replace with actual API service call
    setTimeout(() => {
      this.isLoading.set(false);

      this.snackBar.open(`${type.charAt(0).toUpperCase() + type.slice(1)} verification request sent!`, 'Close', {
        duration: 3000,
        panelClass: ['info-snackbar']
      });
    }, 1000);
  }

  private getVerificationLevelDetails(level: VerificationLevel): {
    name: string;
    description: string;
    color: string;
    icon: string;
  } {
    switch (level) {
      case VerificationLevel.LEVEL_0:
        return {
          name: 'Unverified',
          description: 'Basic account - Limited features',
          color: 'warn',
          icon: 'block'
        };
      case VerificationLevel.LEVEL_1:
        return {
          name: 'Email Verified',
          description: 'Email confirmed - Browse parkings',
          color: 'accent',
          icon: 'email'
        };
      case VerificationLevel.LEVEL_2:
        return {
          name: 'Phone Verified',
          description: 'Phone confirmed - Can make bookings',
          color: 'accent',
          icon: 'phone'
        };
      case VerificationLevel.LEVEL_3:
        return {
          name: 'Identity Verified',
          description: 'Identity confirmed - Can publish parkings',
          color: 'primary',
          icon: 'verified_user'
        };
      case VerificationLevel.LEVEL_4:
        return {
          name: 'Fully Verified',
          description: 'All verifications complete - Full access',
          color: 'primary',
          icon: 'verified'
        };
      default:
        return {
          name: 'Unknown',
          description: 'Unknown verification level',
          color: 'warn',
          icon: 'help'
        };
    }
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return `${this.formatFieldName(fieldName)} is required`;
    }
    if (field.hasError('email')) {
      return 'Please enter a valid email address';
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength').requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    if (field.hasError('maxlength')) {
      const maxLength = field.getError('maxlength').requiredLength;
      return `Maximum ${maxLength} characters allowed`;
    }
    if (field.hasError('pattern')) {
      return 'Please enter a valid phone number';
    }
    return '';
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
  }

  hasFormError(form: FormGroup, error: string): boolean {
    return form.hasError(error);
  }
}
