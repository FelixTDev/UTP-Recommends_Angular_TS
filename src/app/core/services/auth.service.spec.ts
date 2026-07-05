import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthResponse, CurrentUserResponse, RegisterRequest } from '../models/auth.models';

function createJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
  return `${header}.${body}.signature`;
}

describe('AuthService', () => {
  let httpMock: HttpTestingController;
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('register should bootstrap a fully restorable session by fetching the current user', () => {
    const payload: RegisterRequest = {
      email: 'U12345678@utp.edu.pe',
      password: 'Strong!123',
      nombres: 'Ada',
      apellidos: 'Lovelace',
      carreraId: 1
    };

    const authResponse: AuthResponse = {
      token: createJwt({
        sub: payload.email,
        rol: 'ESTUDIANTE',
        nombres: payload.nombres,
        apellidos: payload.apellidos,
        exp: Math.floor(Date.now() / 1000) + 3600
      }),
      tokenType: 'Bearer',
      expiresInMinutes: 60,
      rol: 'ESTUDIANTE',
      userId: 7,
      nombreCompleto: 'Ada Lovelace'
    };

    const currentUser: CurrentUserResponse = {
      userId: 7,
      email: payload.email,
      rol: 'ESTUDIANTE',
      estado: 'ACTIVO',
      nombres: payload.nombres,
      apellidos: payload.apellidos
    };

    let response: AuthResponse | undefined;
    service.register(payload).subscribe((res) => {
      response = res;
    });

    const registerReq = httpMock.expectOne('http://localhost:8081/api/auth/register');
    expect(registerReq.request.method).toBe('POST');
    registerReq.flush(authResponse);

    const meReq = httpMock.expectOne('http://localhost:8081/api/auth/me');
    expect(meReq.request.method).toBe('GET');
    meReq.flush(currentUser);

    expect(response).toEqual(authResponse);
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.currentUser()).toEqual(currentUser);
    expect(localStorage.getItem('utp_recommends_token')).toBe(authResponse.token);
  });
});
