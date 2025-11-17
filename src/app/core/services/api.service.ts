import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface QueryParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any, options?: { params?: QueryParams }): Observable<T> {
    const httpParams = this.buildHttpParams(options?.params);
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body, { params: httpParams });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body: any, options?: { params?: QueryParams }): Observable<T> {
    const httpParams = this.buildHttpParams(options?.params);
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body, { params: httpParams });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, body: any, options?: { params?: QueryParams }): Observable<T> {
    const httpParams = this.buildHttpParams(options?.params);
    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, body, { params: httpParams });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, params?: QueryParams): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  /**
   * Upload file with FormData
   */
  upload<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData);
  }

  /**
   * Download file
   */
  download(endpoint: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${endpoint}`, {
      responseType: 'blob'
    });
  }

  /**
   * Build HttpParams from object
   */
  private buildHttpParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => {
              httpParams = httpParams.append(key, v.toString());
            });
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return httpParams;
  }
}
