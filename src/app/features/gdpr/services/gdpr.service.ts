import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import {
  Consent,
  ConsentType,
  ConsentUpdate,
  DataExportRequest,
  DataDeletionRequest
} from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class GdprService {
  private api = inject(ApiService);

  // Consent Management
  recordConsent(data: ConsentUpdate): Observable<Consent> {
    return this.api.post<Consent>(API_ENDPOINTS.GDPR.CONSENT, data);
  }

  getConsents(): Observable<Consent[]> {
    return this.api.get<Consent[]>(API_ENDPOINTS.GDPR.CONSENTS);
  }

  withdrawConsent(consentType: ConsentType): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(
      API_ENDPOINTS.GDPR.WITHDRAW_CONSENT(consentType),
      {}
    );
  }

  // Data Export
  requestDataExport(): Observable<DataExportRequest> {
    return this.api.post<DataExportRequest>(API_ENDPOINTS.GDPR.DATA_EXPORT, {});
  }

  getDataExportRequests(): Observable<DataExportRequest[]> {
    return this.api.get<DataExportRequest[]>(API_ENDPOINTS.GDPR.DATA_EXPORT_REQUESTS);
  }

  downloadDataExport(requestId: string): Observable<Blob> {
    return this.api.download(
      API_ENDPOINTS.GDPR.DATA_EXPORT_DOWNLOAD(requestId),
      `data-export-${requestId}.zip`
    );
  }

  // Data Deletion
  requestDataDeletion(reason?: string): Observable<DataDeletionRequest> {
    return this.api.post<DataDeletionRequest>(API_ENDPOINTS.GDPR.DATA_DELETION, { reason });
  }

  getDataDeletionRequests(): Observable<DataDeletionRequest[]> {
    return this.api.get<DataDeletionRequest[]>(API_ENDPOINTS.GDPR.DATA_DELETION_REQUESTS);
  }

  // Admin GDPR
  getAllDeletionRequests(): Observable<DataDeletionRequest[]> {
    return this.api.get<DataDeletionRequest[]>(API_ENDPOINTS.GDPR.ADMIN.DELETION_REQUESTS);
  }

  approveDeletion(id: string): Observable<{ message: string }> {
    return this.api.patch<{ message: string }>(
      API_ENDPOINTS.GDPR.ADMIN.APPROVE_DELETION(id),
      {}
    );
  }

  rejectDeletion(id: string, reason: string): Observable<{ message: string }> {
    return this.api.patch<{ message: string }>(
      API_ENDPOINTS.GDPR.ADMIN.REJECT_DELETION(id),
      { reason }
    );
  }

  executeDeletion(id: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>(
      API_ENDPOINTS.GDPR.ADMIN.EXECUTE_DELETION(id),
      {}
    );
  }
}
