import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper">
      <!-- Background Blobs -->
      <div class="auth-bg-blobs">
        <div class="auth-blob auth-blob-1"></div>
        <div class="auth-blob auth-blob-2"></div>
        <div class="auth-blob auth-blob-3"></div>
      </div>

      <div class="auth-container">
        <!-- Columna de Imagen/Ilustración (Izquierda en Login) -->
        <div class="auth-visual-side slide-in-left">
          <div class="visual-img-container">
            <img src="assets/login_img.png" alt="Estudios UTP" class="visual-img" />
          </div>
        </div>

        <!-- Columna del Formulario (Derecha en Login) -->
        <div class="auth-form-side slide-in-right">
          <div class="auth-form-card fade-in-up">
            <div class="text-center mb-4">
              <i class="bi bi-shield-lock-fill text-gold fs-1 mb-2 d-inline-block"></i>
              <h2 class="fw-bold text-white fs-3">Ingresar al Sistema</h2>
              <p class="text-muted-custom small">Inicia sesión con tus credenciales UTP</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <!-- Email Input (Floating) -->
              <div class="floating-group">
                <input 
                  type="email" 
                  class="floating-input" 
                  placeholder=" "
                  formControlName="email"
                  [class.has-value]="loginForm.get('email')?.value"
                  [class.is-invalid]="submitted() && f['email'].errors"
                />
                <span class="floating-icon">
                  <i class="bi bi-envelope"></i>
                </span>
                <label class="floating-label">Correo Institucional</label>
                @if (submitted() && f['email'].errors) {
                  <div class="invalid-feedback">
                    @if (f['email'].errors['required']) { Correo es requerido. }
                    @if (f['email'].errors['email']) { Ingresa un formato de correo válido. }
                  </div>
                }
              </div>

              <!-- Password Input (Floating) -->
              <div class="floating-group">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  class="floating-input" 
                  placeholder=" "
                  formControlName="password"
                  [class.has-value]="loginForm.get('password')?.value"
                  [class.is-invalid]="submitted() && f['password'].errors"
                />
                <span class="floating-icon">
                  <i class="bi bi-lock"></i>
                </span>
                <label class="floating-label">Contraseña</label>
                <button type="button" class="password-toggle-btn" (click)="togglePasswordVisibility()">
                  <i class="bi" [class.bi-eye]="showPassword()" [class.bi-eye-slash]="!showPassword()"></i>
                </button>
                @if (submitted() && f['password'].errors) {
                  <div class="invalid-feedback">
                    Contraseña es requerida.
                  </div>
                }
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn-primary-glass w-100 mt-2"
                [disabled]="isLoading()"
              >
                @if (isLoading()) {
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Ingresando...
                } @else {
                  Iniciar Sesión
                }
              </button>
            </form>

            <div class="text-center mt-4">
              <p class="text-muted-custom small mb-0">
                ¿No tienes cuenta? <a routerLink="/auth/registro" class="text-gold fw-bold text-decoration-none">Regístrate aquí</a>
              </p>
              <a routerLink="/public/inicio" class="text-muted-custom d-block mt-3 small text-decoration-none">
                <i class="bi bi-arrow-left me-1"></i> Volver a la portada
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly submitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  // Getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.uiService.showSuccess(`¡Bienvenido de nuevo, ${res.nombreCompleto}!`);

        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
          return;
        }

        this.router.navigate([res.rol === 'ADMIN' ? '/admin/inicio' : '/estudiante/inicio']);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
