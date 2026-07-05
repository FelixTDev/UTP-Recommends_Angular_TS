import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { PublicService } from '../../../core/services/public.service';
import { UiService } from '../../../core/services/ui.service';
import { CarreraResponse } from '../../../core/models/admin.models';

@Component({
  selector: 'app-registro',
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
        <!-- Columna del Formulario (Izquierda en Registro) -->
        <div class="auth-form-side slide-in-left">
          <div class="auth-form-card register-width fade-in-up">
            <div class="text-center mb-3">
              <i class="bi bi-person-plus-fill text-gold fs-1 mb-2 d-inline-block"></i>
              <h2 class="fw-bold text-white fs-3">Crear Cuenta</h2>
              <p class="text-muted-custom small">Regístrate como estudiante UTP</p>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <!-- Email Input (Floating) -->
              <div class="floating-group">
                <input 
                  type="email" 
                  class="floating-input" 
                  placeholder=" "
                  formControlName="email"
                  [class.has-value]="registerForm.get('email')?.value"
                  [class.is-invalid]="submitted() && f['email'].errors"
                />
                <span class="floating-icon">
                  <i class="bi bi-envelope"></i>
                </span>
                <label class="floating-label">Correo Institucional</label>
                @if (submitted() && f['email'].errors) {
                  <div class="invalid-feedback">
                    @if (f['email'].errors['required']) { Correo es requerido. }
                    @if (f['email'].errors['pattern']) { Formato inválido: Debe ser U + 8 dígitos + &#64;utp.edu.pe }
                  </div>
                }
              </div>

              <!-- Names & Lastnames -->
              <div class="row">
                <div class="col-md-6">
                  <div class="floating-group">
                    <input 
                      type="text" 
                      class="floating-input" 
                      placeholder=" "
                      formControlName="nombres"
                      [class.has-value]="registerForm.get('nombres')?.value"
                      [class.is-invalid]="submitted() && f['nombres'].errors"
                    />
                    <span class="floating-icon">
                      <i class="bi bi-person"></i>
                    </span>
                    <label class="floating-label">Nombres</label>
                    @if (submitted() && f['nombres'].errors) {
                      <div class="invalid-feedback">
                        Mínimo 2 letras.
                      </div>
                    }
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="floating-group">
                    <input 
                      type="text" 
                      class="floating-input" 
                      placeholder=" "
                      formControlName="apellidos"
                      [class.has-value]="registerForm.get('apellidos')?.value"
                      [class.is-invalid]="submitted() && f['apellidos'].errors"
                    />
                    <span class="floating-icon">
                      <i class="bi bi-person"></i>
                    </span>
                    <label class="floating-label">Apellidos</label>
                    @if (submitted() && f['apellidos'].errors) {
                      <div class="invalid-feedback">
                        Mínimo 2 letras.
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Carrera Select (Floating) -->
              <div class="floating-group">
                <select 
                  class="floating-input" 
                  formControlName="carreraId"
                  [class.has-value]="registerForm.get('carreraId')?.value !== ''"
                  [class.is-invalid]="submitted() && f['carreraId'].errors"
                >
                  <option value="" disabled selected hidden></option>
                  @for (carrera of carreras(); track carrera.id) {
                    <option [value]="carrera.id">{{ carrera.nombre }}</option>
                  }
                </select>
                <span class="floating-icon">
                  <i class="bi bi-mortarboard"></i>
                </span>
                <label class="floating-label">Carrera Universitaria</label>
                @if (submitted() && f['carreraId'].errors) {
                  <div class="invalid-feedback">
                    Carrera es requerida.
                  </div>
                }
              </div>

              <!-- Password Input (Floating) -->
              <div class="floating-group mb-4">
                <input 
                  [type]="showPassword() ? 'text' : 'password'" 
                  class="floating-input" 
                  placeholder=" "
                  formControlName="password"
                  [class.has-value]="registerForm.get('password')?.value"
                  [class.is-invalid]="submitted() && f['password'].errors"
                />
                <span class="floating-icon">
                  <i class="bi bi-lock"></i>
                </span>
                <label class="floating-label">Contraseña</label>
                <button type="button" class="password-toggle-btn" (click)="togglePasswordVisibility()">
                  <i class="bi" [class.bi-eye]="showPassword()" [class.bi-eye-slash]="!showPassword()"></i>
                </button>
                
                <!-- Password Strength Visual Meter -->
                <div class="password-strength-wrapper">
                  <div class="strength-bars">
                    <div class="strength-bar" [class.active]="passwordStrength() >= 1" [ngClass]="getStrengthClass()"></div>
                    <div class="strength-bar" [class.active]="passwordStrength() >= 2" [ngClass]="getStrengthClass()"></div>
                    <div class="strength-bar" [class.active]="passwordStrength() >= 3" [ngClass]="getStrengthClass()"></div>
                    <div class="strength-bar" [class.active]="passwordStrength() >= 4" [ngClass]="getStrengthClass()"></div>
                  </div>
                  <span class="strength-text" [ngClass]="getStrengthClass()">{{ getStrengthLabel() }}</span>
                </div>

                @if (submitted() && f['password'].errors) {
                  <div class="invalid-feedback">
                    @if (f['password'].errors['required']) { Contraseña es requerida. }
                    @if (f['password'].errors['pattern']) { Debe incluir minúscula, mayúscula, número y un símbolo (!&#64;#$%&*?_-). }
                  </div>
                }
              </div>

              <!-- Submit Button -->
              <button 
                type="submit" 
                class="btn-primary-glass w-100"
                [disabled]="isLoading()"
              >
                @if (isLoading()) {
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registrando...
                } @else {
                  Registrarme
                }
              </button>
            </form>

            <div class="text-center mt-3">
              <p class="text-muted-custom small mb-0">
                ¿Ya tienes cuenta? <a routerLink="/auth/login" class="text-gold fw-bold text-decoration-none">Inicia sesión aquí</a>
              </p>
              <a routerLink="/public/inicio" class="text-muted-custom d-block mt-3 small text-decoration-none">
                <i class="bi bi-arrow-left me-1"></i> Volver a la portada
              </a>
            </div>
          </div>
        </div>

        <!-- Columna de Imagen/Ilustración (Derecha en Registro) -->
        <div class="auth-visual-side slide-in-right">
          <div class="visual-img-container">
            <img src="assets/register_img.png" alt="Estudios UTP" class="visual-img" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [``]
})
export class RegistroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);

  readonly registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^U[0-9]{8}@utp\.edu\.pe$/)]],
    nombres: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    carreraId: ['', [Validators.required]],
    password: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?_\-])[A-Za-z\d!@#$%&*?_\-]{8,}$/)
    ]]
  });

  readonly carreras = signal<CarreraResponse[]>([]);
  readonly submitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  get f() { return this.registerForm.controls; }

  ngOnInit(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res),
      error: () => this.uiService.showError('No se pudo cargar la lista de carreras activas.')
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  passwordStrength(): number {
    const val = this.registerForm.get('password')?.value || '';
    if (!val) return 0;
    let score = 0;

    // Check length
    if (val.length >= 8) score++;
    // Check both upper and lower case
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
    // Check digit
    if (/\d/.test(val)) score++;
    // Check special char
    if (/[!@#$%&*?_\-]/.test(val)) score++;

    return score;
  }

  getStrengthClass(): string {
    const score = this.passwordStrength();
    if (score === 0) return 'strength-empty';
    if (score === 1) return 'strength-weak';
    if (score === 2) return 'strength-fair';
    if (score === 3) return 'strength-good';
    return 'strength-strong';
  }

  getStrengthLabel(): string {
    const score = this.passwordStrength();
    if (score === 0) return 'Sin ingresar';
    if (score === 1) return 'Muy débil';
    if (score === 2) return 'Débil';
    if (score === 3) return 'Buena';
    return 'Muy segura';
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);

    // Construct payload ensuring carreraId is numeric
    const payload = {
      ...this.registerForm.value,
      carreraId: Number(this.registerForm.value.carreraId)
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.uiService.showSuccess('Cuenta creada correctamente. ¡Bienvenido!');
        this.router.navigate(['/estudiante/inicio']);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
