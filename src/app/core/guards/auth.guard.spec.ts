import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';

function createJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `${header}.${body}.signature`;
}

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      'utp_recommends_token',
      createJwt({
        sub: 'U12345678@utp.edu.pe',
        rol: 'ESTUDIANTE',
        nombres: 'Ada',
        apellidos: 'Lovelace',
        exp: Math.floor(Date.now() / 1000) + 3600
      })
    );

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    httpMock.expectOne('http://localhost:8081/api/auth/me').flush({
      userId: 7,
      email: 'U12345678@utp.edu.pe',
      rol: 'ESTUDIANTE',
      estado: 'ACTIVO',
      nombres: 'Ada',
      apellidos: 'Lovelace'
    });
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should allow navigation when a valid persisted token exists even if in-memory auth state was lost', async () => {
    authService.currentUser.set(null);
    spyOn(router, 'navigate');

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/estudiante/solicitudes/nueva' } as any)
    );

    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(authService.isAuthenticated()).toBeTrue();
    expect(authService.userRole()).toBe('ESTUDIANTE');
  });
});
