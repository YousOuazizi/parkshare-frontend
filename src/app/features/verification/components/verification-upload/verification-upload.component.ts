import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VerificationService } from '../../services/verification.service';
import { DocumentType } from '../../../../core/models/verification.model';

interface DocumentTypeOption {
  value: DocumentType;
  label: string;
  icon: string;
  instructions: string[];
}

@Component({
  selector: 'app-verification-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './verification-upload.component.html',
  styleUrls: ['./verification-upload.component.scss']
})
export class VerificationUploadComponent {
  uploadForm: FormGroup;
  loading = signal(false);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  dragOver = signal(false);

  documentTypes: DocumentTypeOption[] = [
    {
      value: DocumentType.PASSPORT,
      label: 'Passport',
      icon: 'badge',
      instructions: [
        'Upload a clear photo of your passport photo page',
        'Ensure all text is readable',
        'Photo must be in color',
        'File size should not exceed 5MB'
      ]
    },
    {
      value: DocumentType.NATIONAL_ID,
      label: 'National ID Card',
      icon: 'credit_card',
      instructions: [
        'Upload both front and back of your ID card',
        'All corners must be visible',
        'Text and photo must be clear',
        'No glare or shadows on the card'
      ]
    },
    {
      value: DocumentType.DRIVER_LICENSE,
      label: 'Driver License',
      icon: 'drive_eta',
      instructions: [
        'Upload both sides of your driver license',
        'Ensure license is valid (not expired)',
        'All text must be legible',
        'Photo must show your full face clearly'
      ]
    },
    {
      value: DocumentType.ADDRESS_PROOF,
      label: 'Address Proof',
      icon: 'home',
      instructions: [
        'Upload utility bill, bank statement, or lease agreement',
        'Document must be dated within last 3 months',
        'Your name and address must be clearly visible',
        'Accepted formats: PDF, JPG, PNG'
      ]
    },
    {
      value: DocumentType.SELFIE,
      label: 'Selfie with ID',
      icon: 'photo_camera',
      instructions: [
        'Take a selfie holding your ID next to your face',
        'Your face must be clearly visible',
        'ID details should be readable',
        'Use good lighting, no filters or edits'
      ]
    }
  ];

  selectedDocumentType = computed(() => {
    const typeValue = this.uploadForm.get('documentType')?.value;
    return this.documentTypes.find(type => type.value === typeValue);
  });

  constructor(
    private fb: FormBuilder,
    private verificationService: VerificationService
  ) {
    this.uploadForm = this.fb.group({
      documentType: ['', Validators.required]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      this.errorMessage.set('Please upload a valid file (JPG, PNG, or PDF)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      this.errorMessage.set('File size must not exceed 5MB');
      return;
    }

    this.selectedFile.set(file);
    this.errorMessage.set(null);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For PDFs, show a placeholder
      this.previewUrl.set(null);
    }
  }

  removeFile(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile() || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const documentType = this.uploadForm.get('documentType')?.value;
    const file = this.selectedFile();

    if (file) {
      this.verificationService.uploadDocument(documentType, file).subscribe({
        next: (response) => {
          this.loading.set(false);
          this.successMessage.set(response.message || 'Document uploaded successfully! It will be reviewed shortly.');
          this.resetForm();
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(
            error.error?.message || 'Failed to upload document. Please try again.'
          );
        }
      });
    }
  }

  private resetForm(): void {
    this.uploadForm.reset();
    this.selectedFile.set(null);
    this.previewUrl.set(null);
  }

  getFormattedFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
