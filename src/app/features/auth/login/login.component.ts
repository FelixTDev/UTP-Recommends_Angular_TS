import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { UiService } from '../../../core/services/ui.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="auth-page d-flex align-items-center justify-content-center">
      <div class="auth-card glass-card">
        <div class="text-center mb-4">
          <i class="bi bi-star-fill text-gold fs-1 mb-2 d-inline-block"></i>
          <h2 class="fw-bold auth-title">Ingresar al Sistema</h2>
          <p class="text-muted-custom">UTP+Recommends</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <!-- Email Input -->
          <div class="glass-form-group">
            <label class="glass-form-label">Correo Institucional</label>
            <input 
              type="email" 
              class="glass-input" 
              placeholder="Ej: U12345678@utp.edu.pe"
              formControlName="email"
              [class.is-invalid]="submitted() && f['email'].errors"
            />
            @if (submitted() && f['email'].errors) {
              <div class="invalid-feedback">
                @if (f['email'].errors['required']) { Correo es requerido. }
                @if (f['email'].errors['email']) { Ingresa un formato de correo válido. }
              </div>
            }
          </div>

          <!-- Password Input -->
          <div class="glass-form-group">
            <label class="glass-form-label">Contraseña</label>
            <input 
              type="password" 
              class="glass-input" 
              placeholder="••••••••"
              formControlName="password"
              [class.is-invalid]="submitted() && f['password'].errors"
            />
            @if (submitted() && f['password'].errors) {
              <div class="invalid-feedback">
                Contraseña es requerida.
              </div>
            }
          </div>

          <!-- Submit Button -->
          <button 
            type="submit" 
            class="btn-primary-glass w-100 mt-3"
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
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      width: 100vw;
      background: var(--bg-gradient);
      padding: 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 40px 30px;
    }
    .auth-title {
      color: #1f2937;
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  readonly submitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  // Getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.uiService.showSuccess(`¡Bienvenido de nuevo, ${res.nombreCompleto}!`);
        
        // Redirect based on role
        if (res.rol === 'ADMIN') {
          this.router.navigate(['/admin/inicio']);
        } else {
          this.router.navigate(['/estudiante/inicio']);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
