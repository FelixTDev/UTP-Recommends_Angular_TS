import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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
        this.storageService.saveToken(res.token);
        this.currentUser.set({
          userId: res.userId,
          email: '', // will be populated by /me or token data
          rol: res.rol,
          estado: 'ACTIVO',
          nombres: res.nombreCompleto.split(' ')[0] || '',
          apellidos: res.nombreCompleto.split(' ').slice(1).join(' ') || ''
        });
        this.fetchCurrentUser().subscribe();
      })
    );
  }

  register(student: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, student).pipe(
      tap((res) => {
        this.storageService.saveToken(res.token);
        this.currentUser.set({
          userId: res.userId,
          email: student.email,
          rol: res.rol,
          estado: 'ACTIVO',
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
    return this.http.get<CurrentUserResponse>(`${environment.apiUrl}/auth/me`).pipe(
      tap((user) => {
        this.currentUser.set(user);
      })
    );
  }

  logout(): void {
    this.storageService.clearSession();
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  private restoreSession(): void {
    const token = this.storageService.getToken();
    if (token && !this.storageService.isTokenExpired()) {
      const decoded = this.storageService.getDecodedToken();
      if (decoded) {
        // Build basic current user from token before fetching fresh info
        this.currentUser.set({
          userId: this.storageService.getUserId() || 0,
          email: decoded.sub || '',
          rol: this.storageService.getUserRole() || '',
          estado: decoded.estado || 'ACTIVO',
          nombres: decoded.nombres || '',
          apellidos: decoded.apellidos || ''
        });
        
        // Fetch fresh info from backend
        this.fetchCurrentUser().subscribe({
          error: () => this.logout() // If token is invalid on server, log out
        });
      }
    } else {
      this.storageService.clearSession();
    }
  }
}
