import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'utp_recommends_token';

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  getUserRole(): string | null {
    const decoded = this.getDecodedToken();
    if (!decoded) return null;
    
    // Spring Security JWT claims usually look like: "rol" or standard claims
    return decoded.rol || decoded.role || null;
  }

  getUserId(): number | null {
    const decoded = this.getDecodedToken();
    if (!decoded) return null;
    return decoded.id || decoded.userId || decoded.sub ? Number(decoded.id || decoded.userId) : null;
  }

  isTokenExpired(): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded) return true;

    // exp claim is in seconds, Date.now() in ms
    if (decoded.exp) {
      const expirationDate = new Date(decoded.exp * 1000);
      return expirationDate <= new Date();
    }
    return false;
  }
}
