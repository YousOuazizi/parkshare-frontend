import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Parking, ParkingSearchParams, CreateParkingRequest } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private api = inject(ApiService);

  /**
   * Get all parkings
   */
  getAllParkings(params?: ParkingSearchParams): Observable<Parking[]> {
    return this.api.get<Parking[]>(API_ENDPOINTS.PARKINGS.BASE, params);
  }

  /**
   * Search parkings with filters
   */
  searchParkings(params: ParkingSearchParams): Observable<Parking[]> {
    return this.api.get<Parking[]>(API_ENDPOINTS.PARKINGS.SEARCH, params);
  }

  /**
   * Get parking by ID
   */
  getParkingById(id: string): Observable<Parking> {
    return this.api.get<Parking>(API_ENDPOINTS.PARKINGS.BY_ID(id));
  }

  /**
   * Create parking
   */
  createParking(data: CreateParkingRequest): Observable<Parking> {
    return this.api.post<Parking>(API_ENDPOINTS.PARKINGS.BASE, data);
  }

  /**
   * Update parking
   */
  updateParking(id: string, data: Partial<CreateParkingRequest>): Observable<Parking> {
    return this.api.patch<Parking>(API_ENDPOINTS.PARKINGS.BY_ID(id), data);
  }

  /**
   * Delete parking
   */
  deleteParking(id: string): Observable<void> {
    return this.api.delete<void>(API_ENDPOINTS.PARKINGS.BY_ID(id));
  }

  /**
   * Check parking availability
   */
  checkAvailability(id: string, startTime: string, endTime: string): Observable<{ available: boolean }> {
    return this.api.get<{ available: boolean }>(
      API_ENDPOINTS.PARKINGS.CHECK_AVAILABILITY(id),
      { startTime, endTime }
    );
  }

  /**
   * Upload parking photo
   */
  uploadPhoto(parkingId: string, file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('parkingId', parkingId);
    return this.api.upload<{ url: string }>('/parkings/upload-photo', formData);
  }
}
