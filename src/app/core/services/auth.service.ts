import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of, interval } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { User, AuthResponse, LoginRequest, RegisterRequest, UserRole, VerificationLevel } from '../models';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private router = inject(Router);

  // Signals for reactive state management
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private isLoadingSignal = signal<boolean>(false);

  // Public computed signals
  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();

  // Computed signals for role and verification checks
  isAdmin = computed(() => this.currentUserSignal()?.role === UserRole.ADMIN);
  isOwner = computed(() => this.currentUserSignal()?.role === UserRole.OWNER || this.currentUserSignal()?.role === UserRole.ADMIN);
  verificationLevel = computed(() => this.currentUserSignal()?.verificationLevel || VerificationLevel.LEVEL_0);

  // Level checks
  canBook = computed(() => {
    const level = this.verificationLevel();
    return level === VerificationLevel.LEVEL_2 ||
           level === VerificationLevel.LEVEL_3 ||
           level === VerificationLevel.LEVEL_4;
  });

  canPublishParking = computed(() => {
    const level = this.verificationLevel();
    return level === VerificationLevel.LEVEL_3 || level === VerificationLevel.LEVEL_4;
  });

  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private tokenRefreshSubscription?: any;

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from storage
   */
  private initializeAuth(): void {
    const token = this.getAccessToken();
    if (token && !this.isTokenExpired(token)) {
      this.loadUserProfile();
      this.startTokenRefreshTimer();
    } else {
      this.clearAuth();
    }
  }

  /**
   * Register new user
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    return this.api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Login user
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    return this.api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(error => {
        this.isLoadingSignal.set(false);
        throw error;
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<any> {
    return this.api.post(API_ENDPOINTS.AUTH.LOGOUT, {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }),
      catchError(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
        return of(null);
      })
    );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearAuth();
      return of({} as AuthResponse);
    }

    return this.api.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }).pipe(
      tap(response => {
        this.storage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
        if (response.refreshToken) {
          this.storage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
        }
      }),
      catchError(error => {
        this.clearAuth();
        throw error;
      })
    );
  }

  /**
   * Load user profile
   */
  loadUserProfile(): void {
    this.api.get<User>(API_ENDPOINTS.AUTH.PROFILE).subscribe({
      next: user => {
        this.currentUserSignal.set(user);
        this.isAuthenticatedSignal.set(true);
        this.isLoadingSignal.set(false);
      },
      error: () => {
        this.clearAuth();
      }
    });
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.storage.getItem<string>(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.storage.getItem<string>(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const expirationDate = new Date(decoded.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    this.storage.setItem(this.ACCESS_TOKEN_KEY, response.accessToken);
    this.storage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    this.currentUserSignal.set(response.user);
    this.isAuthenticatedSignal.set(true);
    this.isLoadingSignal.set(false);
    this.startTokenRefreshTimer();
  }

  /**
   * Clear authentication state
   */
  private clearAuth(): void {
    this.storage.removeItem(this.ACCESS_TOKEN_KEY);
    this.storage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.isLoadingSignal.set(false);
    this.stopTokenRefreshTimer();
  }

  /**
   * Start automatic token refresh timer
   */
  private startTokenRefreshTimer(): void {
    this.stopTokenRefreshTimer();
    this.tokenRefreshSubscription = interval(environment.tokenRefreshInterval).subscribe(() => {
      this.refreshToken().subscribe();
    });
  }

  /**
   * Stop token refresh timer
   */
  private stopTokenRefreshTimer(): void {
    if (this.tokenRefreshSubscription) {
      this.tokenRefreshSubscription.unsubscribe();
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.currentUserSignal()?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.currentUserSignal()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Check if user has minimum verification level
   */
  hasMinimumVerificationLevel(level: VerificationLevel): boolean {
    const userLevel = this.verificationLevel();
    const levels = [
      VerificationLevel.LEVEL_0,
      VerificationLevel.LEVEL_1,
      VerificationLevel.LEVEL_2,
      VerificationLevel.LEVEL_3,
      VerificationLevel.LEVEL_4
    ];
    const userLevelIndex = levels.indexOf(userLevel);
    const requiredLevelIndex = levels.indexOf(level);
    return userLevelIndex >= requiredLevelIndex;
  }

  /**
   * Update current user
   */
  updateCurrentUser(user: User): void {
    this.currentUserSignal.set(user);
  }
}
