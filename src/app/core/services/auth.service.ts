import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, shareReplay, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, ChangePasswordRequest, AuthResponse, CurrentUserResponse } from '../models/auth.models';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly router = inject(Router);
  private currentUserRequest$: Observable<CurrentUserResponse> | null = null;

  // Core signals for auth state
  readonly currentUser = signal<CurrentUserResponse | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.rol ?? null);

  constructor() {
    this.restoreSession();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        this.establishSession(res);
      })
    );
  }

  register(student: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, student).pipe(
      tap((res) => {
        this.establishSession(res, {
          email: student.email,
          nombres: student.nombres,
          apellidos: student.apellidos
        });
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/auth/change-password`, request);
  }

  fetchCurrentUser(): Observable<CurrentUserResponse> {
    if (!this.currentUserRequest$) {
      this.currentUserRequest$ = this.http.get<CurrentUserResponse>(`${environment.apiUrl}/auth/me`).pipe(
        tap((user) => {
          this.currentUser.set(user);
        }),
        finalize(() => {
          this.currentUserRequest$ = null;
        }),
        shareReplay(1)
      );
    }

    return this.currentUserRequest$;
  }

  logout(): void {
    this.storageService.clearSession();
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  ensureAuthenticatedSession(): boolean {
    if (this.isAuthenticated()) {
      return true;
    }

    if (!this.hasValidPersistedSession()) {
      return false;
    }

    return this.hydrateCurrentUserFromToken();
  }

  hasValidPersistedSession(): boolean {
    const token = this.storageService.getToken();
    if (!token || this.storageService.isTokenExpired()) {
      this.storageService.clearSession();
      return false;
    }

    return this.storageService.getDecodedToken() !== null;
  }

  private restoreSession(): void {
    if (!this.ensureAuthenticatedSession()) {
      this.storageService.clearSession();
      return;
    }

    this.fetchCurrentUser().subscribe({
      error: () => {
        // Keep the locally restorable session on transient failures.
        // Invalid server-side sessions are handled centrally by the HTTP error interceptor.
      }
    });
  }

  private establishSession(
    response: AuthResponse,
    fallback?: { email?: string; nombres?: string; apellidos?: string }
  ): void {
    this.storageService.saveToken(response.token);
    this.currentUser.set(this.buildCurrentUserFromToken(fallback, response));
    this.fetchCurrentUser().subscribe({
      error: () => {
        // Invalid auth responses will surface through the HTTP interceptor on the failing request.
      }
    });
  }

  private hydrateCurrentUserFromToken(): boolean {
    const nextUser = this.buildCurrentUserFromToken();
    if (!nextUser) {
      this.storageService.clearSession();
      return false;
    }

    this.currentUser.set(nextUser);
    return true;
  }

  private buildCurrentUserFromToken(
    fallback?: { email?: string; nombres?: string; apellidos?: string },
    response?: AuthResponse
  ): CurrentUserResponse | null {
    const decoded = this.storageService.getDecodedToken();
    if (!decoded) {
      return null;
    }

    const rol = this.storageService.getUserRole() || response?.rol || '';
    const nombres = decoded.nombres || fallback?.nombres || response?.nombreCompleto.split(' ')[0] || '';
    const apellidos =
      decoded.apellidos || fallback?.apellidos || response?.nombreCompleto.split(' ').slice(1).join(' ') || '';

    return {
      userId: this.storageService.getUserId() || response?.userId || 0,
      email: decoded.sub || fallback?.email || '',
      rol,
      estado: decoded.estado || 'ACTIVO',
      nombres,
      apellidos
    };
  }
}
