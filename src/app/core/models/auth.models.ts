export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  carreraId: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresInMinutes: number;
  rol: string;
  userId: number;
  nombreCompleto: string;
}

export interface CurrentUserResponse {
  userId: number;
  email: string;
  rol: string;
  estado: string;
  nombres: string;
  apellidos: string;
}
