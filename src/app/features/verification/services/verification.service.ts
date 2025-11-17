import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  VerificationInfo,
  EmailVerificationRequest,
  EmailVerificationConfirm,
  PhoneVerificationRequest,
  PhoneVerificationConfirm,
  DocumentType
} from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class VerificationService {
  private api = inject(ApiService);

  /**
   * Get verification info
   */
  getVerificationInfo(): Observable<VerificationInfo> {
    return this.api.get<VerificationInfo>(API_ENDPOINTS.VERIFICATION.BASE);
  }

  /**
   * Request email verification
   */
  requestEmailVerification(data: EmailVerificationRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.VERIFICATION.EMAIL_REQUEST, data);
  }

  /**
   * Verify email
   */
  verifyEmail(data: EmailVerificationConfirm): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.VERIFICATION.EMAIL_VERIFY, data);
  }

  /**
   * Request phone verification
   */
  requestPhoneVerification(data: PhoneVerificationRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.VERIFICATION.PHONE_REQUEST, data);
  }

  /**
   * Verify phone
   */
  verifyPhone(data: PhoneVerificationConfirm): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(API_ENDPOINTS.VERIFICATION.PHONE_VERIFY, data);
  }

  /**
   * Upload document
   */
  uploadDocument(type: DocumentType, file: File): Observable<{ message: string }> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('document', file);
    return this.api.upload<{ message: string }>(API_ENDPOINTS.VERIFICATION.DOCUMENT_UPLOAD, formData);
  }

  /**
   * Approve identity verification (admin)
   */
  approveIdentity(userId: string): Observable<{ message: string }> {
    return this.api.patch<{ message: string }>(
      API_ENDPOINTS.VERIFICATION.IDENTITY_APPROVE(userId),
      {}
    );
  }

  /**
   * Approve advanced verification (admin)
   */
  approveAdvanced(userId: string): Observable<{ message: string }> {
    return this.api.patch<{ message: string }>(
      API_ENDPOINTS.VERIFICATION.ADVANCED_APPROVE(userId),
      {}
    );
  }
}
