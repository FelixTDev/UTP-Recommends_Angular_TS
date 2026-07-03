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
    <div class="auth-page d-flex align-items-center justify-content-center">
      <div class="auth-card glass-card">
        <div class="text-center mb-4">
          <i class="bi bi-star-fill text-gold fs-1 mb-2 d-inline-block"></i>
          <h2 class="fw-bold auth-title">Crear Cuenta</h2>
          <p class="text-muted-custom">Estudiante UTP</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
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
                @if (f['email'].errors['pattern']) { Formato inválido: Debe ser U + 8 dígitos + &#64;utp.edu.pe }
              </div>
            }
          </div>

          <!-- Names & Lastnames -->
          <div class="row">
            <div class="col-md-6">
              <div class="glass-form-group">
                <label class="glass-form-label">Nombres</label>
                <input 
                  type="text" 
                  class="glass-input" 
                  formControlName="nombres"
                  [class.is-invalid]="submitted() && f['nombres'].errors"
                />
                @if (submitted() && f['nombres'].errors) {
                  <div class="invalid-feedback">
                    Nombres inválidos (solo letras, mín. 2).
                  </div>
                }
              </div>
            </div>
            <div class="col-md-6">
              <div class="glass-form-group">
                <label class="glass-form-label">Apellidos</label>
                <input 
                  type="text" 
                  class="glass-input" 
                  formControlName="apellidos"
                  [class.is-invalid]="submitted() && f['apellidos'].errors"
                />
                @if (submitted() && f['apellidos'].errors) {
                  <div class="invalid-feedback">
                    Apellidos inválidos (solo letras, mín. 2).
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Carrera Select -->
          <div class="glass-form-group">
            <label class="glass-form-label">Carrera Universitaria</label>
            <select 
              class="glass-input" 
              formControlName="carreraId"
              [class.is-invalid]="submitted() && f['carreraId'].errors"
            >
              <option value="">Selecciona tu carrera</option>
              @for (carrera of carreras(); track carrera.id) {
                <option [value]="carrera.id">{{ carrera.nombre }}</option>
              }
            </select>
            @if (submitted() && f['carreraId'].errors) {
              <div class="invalid-feedback">
                Carrera es requerida.
              </div>
            }
          </div>

          <!-- Password Input -->
          <div class="glass-form-group">
            <label class="glass-form-label">Contraseña</label>
            <input 
              type="password" 
              class="glass-input" 
              placeholder="Mínimo 8 caracteres"
              formControlName="password"
              [class.is-invalid]="submitted() && f['password'].errors"
            />
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
            class="btn-primary-glass w-100 mt-3"
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

        <div class="text-center mt-4">
          <p class="text-muted-custom small mb-0">
            ¿Ya tienes cuenta? <a routerLink="/auth/login" class="text-gold fw-bold text-decoration-none">Inicia sesión aquí</a>
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
      padding: 40px 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 500px;
      padding: 40px 30px;
    }
    .auth-title {
      color: #1f2937;
    }
  `]
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

  get f() { return this.registerForm.controls; }

  ngOnInit(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res),
      error: () => this.uiService.showError('No se pudo cargar la lista de carreras activas.')
    });
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
