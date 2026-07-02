import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { AuthService } from '../../../core/auth/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { StudentProfileResponse } from '../../../core/models/student.models';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="student-profile">
      <div class="row mb-4">
        <div class="col">
          <h1 class="h2 fw-bold text-white">Mi Perfil</h1>
          <p class="text-muted-custom">Administra tus datos personales y configuración de seguridad.</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Info & Edit Profile Form -->
        <div class="col-lg-7">
          <div class="glass-card mb-4">
            <h2 class="h5 fw-bold text-white mb-4"><i class="bi bi-person-gear me-2 text-gold"></i>Datos Personales</h2>

            <!-- Read Only Specs -->
            <div class="row g-3 mb-4 text-start bg-dark-opacity p-3 rounded">
              <div class="col-md-4">
                <span class="d-block small text-muted-custom">Código Estudiante</span>
                <strong class="text-white">{{ profile()?.codigoEstudiante }}</strong>
              </div>
              <div class="col-md-8">
                <span class="d-block small text-muted-custom">Carrera Profesional</span>
                <strong class="text-white">{{ profile()?.carreraNombre }}</strong>
              </div>
              <div class="col-md-12">
                <span class="d-block small text-muted-custom">Correo Institucional</span>
                <strong class="text-white">{{ profile()?.email }}</strong>
              </div>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
              <div class="row">
                <div class="col-md-6">
                  <div class="glass-form-group">
                    <label class="glass-form-label">Nombres</label>
                    <input 
                      type="text" 
                      class="glass-input" 
                      formControlName="nombres"
                      [class.is-invalid]="profileSubmitted() && pf['nombres'].errors"
                    />
                    @if (profileSubmitted() && pf['nombres'].errors) {
                      <div class="invalid-feedback">
                        Nombres son obligatorios (solo letras).
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
                      [class.is-invalid]="profileSubmitted() && pf['apellidos'].errors"
                    />
                    @if (profileSubmitted() && pf['apellidos'].errors) {
                      <div class="invalid-feedback">
                        Apellidos son obligatorios (solo letras).
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div class="text-end mt-3">
                <button 
                  type="submit" 
                  class="btn-primary-glass"
                  [disabled]="isUpdatingProfile()"
                >
                  @if (isUpdatingProfile()) {
                    Guardando...
                  } @else {
                    <i class="bi bi-save me-2"></i>Guardar Cambios
                  }
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Security / Password Form -->
        <div class="col-lg-5">
          <div class="glass-card">
            <h2 class="h5 fw-bold text-white mb-4"><i class="bi bi-shield-lock me-2 text-gold"></i>Seguridad</h2>

            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
              <!-- Current Password -->
              <div class="glass-form-group">
                <label class="glass-form-label">Contraseña Actual</label>
                <input 
                  type="password" 
                  class="glass-input" 
                  placeholder="••••••••"
                  formControlName="currentPassword"
                  [class.is-invalid]="passwordSubmitted() && pw['currentPassword'].errors"
                />
                @if (passwordSubmitted() && pw['currentPassword'].errors) {
                  <div class="invalid-feedback">
                    Contraseña actual es requerida.
                  </div>
                }
              </div>

              <!-- New Password -->
              <div class="glass-form-group">
                <label class="glass-form-label">Nueva Contraseña</label>
                <input 
                  type="password" 
                  class="glass-input" 
                  placeholder="Mínimo 8 caracteres"
                  formControlName="newPassword"
                  [class.is-invalid]="passwordSubmitted() && pw['newPassword'].errors"
                />
                @if (passwordSubmitted() && pw['newPassword'].errors) {
                  <div class="invalid-feedback">
                    @if (pw['newPassword'].errors['required']) { Nueva contraseña es requerida. }
                    @if (pw['newPassword'].errors['pattern']) { Debe incluir minúscula, mayúscula, número y un símbolo (!&#64;#$%&*?_-). }
                  </div>
                }
              </div>

              <div class="text-end mt-4">
                <button 
                  type="submit" 
                  class="btn-primary-glass w-100"
                  [disabled]="isChangingPassword()"
                >
                  @if (isChangingPassword()) {
                    Cambiando...
                  } @else {
                    Cambiar Contraseña
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .student-profile {
      color: var(--text-primary);
    }
    .bg-dark-opacity {
      background: rgba(0, 0, 0, 0.2);
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);

  readonly profile = signal<StudentProfileResponse | null>(null);
  readonly isUpdatingProfile = signal<boolean>(false);
  readonly isChangingPassword = signal<boolean>(false);

  readonly profileSubmitted = signal<boolean>(false);
  readonly passwordSubmitted = signal<boolean>(false);

  readonly profileForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]]
  });

  readonly passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?_\-])[A-Za-z\d!@#$%&*?_\-]{8,}$/)
    ]]
  });

  get pf() { return this.profileForm.controls; }
  get pw() { return this.passwordForm.controls; }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.studentService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res);
        this.profileForm.patchValue({
          nombres: res.nombres,
          apellidos: res.apellidos
        });
      },
      error: () => this.uiService.showError('No se pudo cargar la información del perfil.')
    });
  }

  onUpdateProfile(): void {
    this.profileSubmitted.set(true);
    if (this.profileForm.invalid) return;

    this.isUpdatingProfile.set(true);
    this.studentService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.isUpdatingProfile.set(false);
        this.uiService.showSuccess('Perfil actualizado correctamente.');
        
        // Sync header state
        this.authService.fetchCurrentUser().subscribe();
        
        this.profile.set(res);
      },
      error: () => this.isUpdatingProfile.set(false)
    });
  }

  onChangePassword(): void {
    this.passwordSubmitted.set(true);
    if (this.passwordForm.invalid) return;

    this.isChangingPassword.set(true);
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordForm.reset();
        this.passwordSubmitted.set(false);
        this.uiService.showSuccess('Contraseña cambiada correctamente.');
      },
      error: () => this.isChangingPassword.set(false)
    });
  }
}
