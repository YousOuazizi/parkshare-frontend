import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { User, UserRole } from '../../../core/models/user.model';
import { VerificationDocument, DocumentStatus } from '../../../core/models/verification.model';

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  verificationLevel?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  usersByRole: {
    USER: number;
    OWNER: number;
    ADMIN: number;
  };
  usersByVerificationLevel: {
    [key: string]: number;
  };
  newUsersThisMonth: number;
  newUsersLastMonth: number;
}

export interface VerificationQueueParams {
  page?: number;
  limit?: number;
  status?: DocumentStatus;
  level?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VerificationQueueResponse {
  documents: VerificationDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DocumentReviewRequest {
  status: DocumentStatus;
  rejectionReason?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  services: {
    database: {
      status: string;
      responseTime: number;
    };
    cache: {
      status: string;
      responseTime: number;
    };
    storage: {
      status: string;
      responseTime: number;
    };
  };
  resources: {
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      percentage: number;
    };
    disk: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

export interface ApplicationSettings {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailVerificationRequired: boolean;
  phoneVerificationRequired: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
  rateLimit: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  updatedAt: string;
}

export interface CacheStats {
  keys: number;
  hits: number;
  misses: number;
  hitRate: number;
  memoryUsage: number;
}

export interface DatabaseStats {
  connections: {
    active: number;
    idle: number;
    total: number;
  };
  tables: {
    name: string;
    rowCount: number;
    size: string;
  }[];
  queryPerformance: {
    avgQueryTime: number;
    slowQueries: number;
  };
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  metadata?: any;
}

export interface LogQueryParams {
  page?: number;
  limit?: number;
  level?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private api = inject(ApiService);

  // User Management

  /**
   * Get paginated list of users
   */
  getUsers(params?: UserListParams): Observable<UserListResponse> {
    return this.api.get<UserListResponse>('/admin/users', params);
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): Observable<User> {
    return this.api.get<User>(`/admin/users/${userId}`);
  }

  /**
   * Update user
   */
  updateUser(userId: string, data: UserUpdateRequest): Observable<User> {
    return this.api.patch<User>(`/admin/users/${userId}`, data);
  }

  /**
   * Suspend user account
   */
  suspendUser(userId: string): Observable<{ message: string }> {
    return this.api.patch<{ message: string }>(`/admin/users/${userId}/suspend`, {});
  }

  /**
   * Activate user account
   */
  activateUser(userId: string): Observable<{ message: string }> {
    return this.api.patch<{ message: string }>(`/admin/users/${userId}/activate`, {});
  }

  /**
   * Delete user
   */
  deleteUser(userId: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/admin/users/${userId}`);
  }

  /**
   * Bulk suspend users
   */
  bulkSuspendUsers(userIds: string[]): Observable<{ message: string; count: number }> {
    return this.api.post<{ message: string; count: number }>('/admin/users/bulk/suspend', { userIds });
  }

  /**
   * Bulk delete users
   */
  bulkDeleteUsers(userIds: string[]): Observable<{ message: string; count: number }> {
    return this.api.post<{ message: string; count: number }>('/admin/users/bulk/delete', { userIds });
  }

  /**
   * Get user statistics
   */
  getUserStatistics(): Observable<UserStatistics> {
    return this.api.get<UserStatistics>('/admin/users/statistics');
  }

  // Verification Management

  /**
   * Get verification queue
   */
  getVerificationQueue(params?: VerificationQueueParams): Observable<VerificationQueueResponse> {
    return this.api.get<VerificationQueueResponse>('/admin/verifications/queue', params);
  }

  /**
   * Get verification document by ID
   */
  getVerificationDocument(documentId: string): Observable<VerificationDocument> {
    return this.api.get<VerificationDocument>(`/admin/verifications/documents/${documentId}`);
  }

  /**
   * Review verification document
   */
  reviewDocument(documentId: string, data: DocumentReviewRequest): Observable<{ message: string }> {
    return this.api.patch<{ message: string }>(`/admin/verifications/documents/${documentId}/review`, data);
  }

  /**
   * Bulk approve documents
   */
  bulkApproveDocuments(documentIds: string[]): Observable<{ message: string; count: number }> {
    return this.api.post<{ message: string; count: number }>('/admin/verifications/bulk/approve', { documentIds });
  }

  /**
   * Bulk reject documents
   */
  bulkRejectDocuments(documentIds: string[], rejectionReason: string): Observable<{ message: string; count: number }> {
    return this.api.post<{ message: string; count: number }>('/admin/verifications/bulk/reject', {
      documentIds,
      rejectionReason
    });
  }

  /**
   * Get verification history for user
   */
  getVerificationHistory(userId: string): Observable<VerificationDocument[]> {
    return this.api.get<VerificationDocument[]>(`/admin/verifications/history/${userId}`);
  }

  // System Management

  /**
   * Get system health
   */
  getSystemHealth(): Observable<SystemHealth> {
    return this.api.get<SystemHealth>('/admin/system/health');
  }

  /**
   * Get application settings
   */
  getApplicationSettings(): Observable<ApplicationSettings> {
    return this.api.get<ApplicationSettings>('/admin/system/settings');
  }

  /**
   * Update application settings
   */
  updateApplicationSettings(settings: Partial<ApplicationSettings>): Observable<ApplicationSettings> {
    return this.api.put<ApplicationSettings>('/admin/system/settings', settings);
  }

  /**
   * Get feature flags
   */
  getFeatureFlags(): Observable<FeatureFlag[]> {
    return this.api.get<FeatureFlag[]>('/admin/system/feature-flags');
  }

  /**
   * Toggle feature flag
   */
  toggleFeatureFlag(flagName: string, enabled: boolean): Observable<FeatureFlag> {
    return this.api.patch<FeatureFlag>(`/admin/system/feature-flags/${flagName}`, { enabled });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): Observable<CacheStats> {
    return this.api.get<CacheStats>('/admin/system/cache/stats');
  }

  /**
   * Clear cache
   */
  clearCache(): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/admin/system/cache/clear', {});
  }

  /**
   * Get database statistics
   */
  getDatabaseStats(): Observable<DatabaseStats> {
    return this.api.get<DatabaseStats>('/admin/system/database/stats');
  }

  /**
   * Get system logs
   */
  getSystemLogs(params?: LogQueryParams): Observable<{ logs: SystemLog[]; total: number }> {
    return this.api.get<{ logs: SystemLog[]; total: number }>('/admin/system/logs', params);
  }
}
