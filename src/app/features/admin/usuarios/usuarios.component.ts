import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PublicService } from '../../../core/services/public.service';
import { UsuarioResponse, CarreraResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  template: `
    <div class="admin-usuarios">
      <div class="row mb-4 align-items-center">
        <div class="col-md-6">
          <h1 class="h2 fw-bold text-white">Gestionar Usuarios</h1>
          <p class="text-muted-custom">Administra cuentas, roles y estados de los usuarios del sistema.</p>
        </div>
        <div class="col-md-6 d-flex flex-wrap gap-2 justify-content-md-end">
          <div class="d-flex align-items-center bg-dark-opacity px-3 py-1.5 rounded border border-white-05">
            <label class="me-2 small text-muted-custom">Rol:</label>
            <select class="bg-transparent border-0 text-white small" [(ngModel)]="filterRol" (change)="loadUsuarios()">
              <option value="">Todos</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ESTUDIANTE">ESTUDIANTE</option>
            </select>
          </div>

          <div class="d-flex align-items-center bg-dark-opacity px-3 py-1.5 rounded border border-white-05">
            <label class="me-2 small text-muted-custom">Estado:</label>
            <select class="bg-transparent border-0 text-white small" [(ngModel)]="filterEstado" (change)="loadUsuarios()">
              <option value="">Todos</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
              <option value="SUSPENDIDO">SUSPENDIDO</option>
            </select>
          </div>

          <button class="btn-primary-glass px-3 py-1.5" (click)="openCreateForm()">
            <i class="bi bi-plus-circle me-2"></i>Nuevo Usuario
          </button>
        </div>
      </div>

      <div class="row g-4">
        <!-- List Column -->
        <div class="col-lg-8">
          <div class="glass-card">
            <div class="glass-table-container">
              <table class="glass-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Carrera / Cód.</th>
                    <th>Reseñas</th>
                    <th>Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (usr of usuarios(); track usr.id) {
                    <tr>
                      <td class="text-white fw-bold">{{ usr.nombres }} {{ usr.apellidos }}</td>
                      <td class="small">{{ usr.email }}</td>
                      <td>
                        <span class="badge-badge" [class.badge-warning]="usr.rol === 'ADMIN'" [class.badge-primary]="usr.rol === 'ESTUDIANTE'">
                          {{ usr.rol }}
                        </span>
                      </td>
                      <td class="small text-muted-custom">
                        @if (usr.rol === 'ESTUDIANTE') {
                          {{ usr.carreraNombre || 'Sin carrera' }} <br/>
                          <span class="font-monospace text-muted">{{ usr.codigoEstudiante }}</span>
                        } @else {
                          -
                        }
                      </td>
                      <td class="text-center font-monospace">{{ usr.totalResenas }}</td>
                      <td>
                        @let status = (usr.estado | statusBadge);
                        <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                      </td>
                      <td class="text-end">
                        <div class="btn-group">
                          <button class="btn btn-sm btn-outline-info" (click)="openEditForm(usr)" title="Editar">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-sm btn-outline-warning" (click)="changeStatus(usr, 'SUSPENDIDO')" title="Suspender" [disabled]="usr.estado === 'SUSPENDIDO'">
                            <i class="bi bi-slash-circle"></i>
                          </button>
                          @if (usr.estado === 'ACTIVO') {
                            <button class="btn btn-sm btn-outline-danger" (click)="changeStatus(usr, 'INACTIVO')" title="Inactivar">
                              <i class="bi bi-toggle-off"></i>
                            </button>
                          } @else {
                            <button class="btn btn-sm btn-outline-success" (click)="changeStatus(usr, 'ACTIVO')" title="Activar">
                              <i class="bi bi-toggle-on"></i>
                            </button>
                          }
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Form Column (Collapsible/Conditional) -->
        @if (showForm()) {
          <div class="col-lg-4">
            <div class="glass-card">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h5 fw-bold text-white mb-0">
                  {{ isEditMode() ? 'Editar Usuario' : 'Nuevo Usuario' }}
                </h2>
                <button class="btn-close btn-close-white" (click)="closeForm()"></button>
              </div>

              <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
                <!-- Email -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    class="glass-input" 
                    placeholder="ejemplo@utp.edu.pe"
                    formControlName="email"
                    [class.is-invalid]="submitted() && f['email'].errors"
                  />
                  @if (submitted() && f['email'].errors) {
                    <div class="invalid-feedback">Formato de correo institucional obligatorio.</div>
                  }
                </div>

                <!-- Password (Required only in Create mode) -->
                @if (!isEditMode()) {
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
                      <div class="invalid-feedback">Debe cumplir con la política de contraseñas.</div>
                    }
                  </div>
                }

                <!-- Names & Lastnames -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Nombres</label>
                  <input 
                    type="text" 
                    class="glass-input" 
                    formControlName="nombres"
                    [class.is-invalid]="submitted() && f['nombres'].errors"
                  />
                  @if (submitted() && f['nombres'].errors) {
                    <div class="invalid-feedback">Nombres son obligatorios (solo letras).</div>
                  }
                </div>

                <div class="glass-form-group">
                  <label class="glass-form-label">Apellidos</label>
                  <input 
                    type="text" 
                    class="glass-input" 
                    formControlName="apellidos"
                    [class.is-invalid]="submitted() && f['apellidos'].errors"
                  />
                  @if (submitted() && f['apellidos'].errors) {
                    <div class="invalid-feedback">Apellidos son obligatorios (solo letras).</div>
                  }
                </div>

                <!-- Rol (Only in Create mode) -->
                @if (!isEditMode()) {
                  <div class="glass-form-group">
                    <label class="glass-form-label">Rol del Usuario</label>
                    <select 
                      class="glass-input" 
                      formControlName="rol"
                      [class.is-invalid]="submitted() && f['rol'].errors"
                    >
                      <option value="ESTUDIANTE">ESTUDIANTE</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                }

                <!-- Carrera Select (Conditional for ESTUDIANTE) -->
                @if (showCarreraSelect()) {
                  <div class="glass-form-group">
                    <label class="glass-form-label">Carrera (Obligatorio para Estudiantes)</label>
                    <select 
                      class="glass-input" 
                      formControlName="carreraId"
                      [class.is-invalid]="submitted() && f['carreraId'].errors"
                    >
                      <option value="">Selecciona la carrera...</option>
                      @for (carrera of carreras(); track carrera.id) {
                        <option [value]="carrera.id">{{ carrera.nombre }}</option>
                      }
                    </select>
                    @if (submitted() && f['carreraId'].errors) {
                      <div class="invalid-feedback">Carrera es requerida.</div>
                    }
                  </div>
                }

                <!-- Submit buttons -->
                <div class="d-flex gap-2 justify-content-end mt-4">
                  <button type="button" class="btn-secondary-glass py-2" (click)="closeForm()">Cancelar</button>
                  <button type="submit" class="btn-primary-glass py-2" [disabled]="isLoadingForm()">
                    {{ isEditMode() ? 'Guardar' : 'Crear' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-usuarios {
      color: var(--text-primary);
    }
    .bg-dark-opacity {
      background: rgba(0, 0, 0, 0.2);
    }
    .border-white-05 {
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
  `]
})
export class UsuariosComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly carreras = signal<CarreraResponse[]>([]);
  
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  readonly showCarreraSelect = signal<boolean>(true);
  
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  // Filters state
  filterRol = '';
  filterEstado = '';

  readonly userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    nombres: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    rol: ['ESTUDIANTE', [Validators.required]],
    carreraId: ['']
  });

  get f() { return this.userForm.controls; }

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadCarreras();

    // Watch rol changes to toggle and validate Carrera Select
    this.userForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.updateCarreraValidation(rol || 'ESTUDIANTE');
    });
  }

  loadUsuarios(): void {
    const rol = this.filterRol ? this.filterRol : undefined;
    const estado = this.filterEstado ? this.filterEstado : undefined;

    this.adminService.listarUsuarios(rol, estado).subscribe({
      next: (res) => this.usuarios.set(res),
      error: () => this.uiService.showError('No se pudieron cargar los usuarios.')
    });
  }

  loadCarreras(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res)
    });
  }

  updateCarreraValidation(rol: string): void {
    const carreraCtrl = this.userForm.get('carreraId');
    if (rol === 'ESTUDIANTE') {
      this.showCarreraSelect.set(true);
      carreraCtrl?.setValidators([Validators.required]);
    } else {
      this.showCarreraSelect.set(false);
      carreraCtrl?.clearValidators();
      carreraCtrl?.setValue('');
    }
    carreraCtrl?.updateValueAndValidity();
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.userForm.reset({ rol: 'ESTUDIANTE' });
    this.userForm.get('password')?.setValidators([
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?_\-])[A-Za-z\d!@#$%&*?_\-]{8,}$/)
    ]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.updateCarreraValidation('ESTUDIANTE');
    this.submitted.set(false);
  }

  openEditForm(usr: UsuarioResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(usr.id);
    this.userForm.patchValue({
      email: usr.email,
      nombres: usr.nombres,
      apellidos: usr.apellidos,
      rol: usr.rol,
      carreraId: usr.carreraId ? usr.carreraId.toString() : ''
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.updateCarreraValidation(usr.rol);
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.userForm.reset();
  }

  changeStatus(usr: UsuarioResponse, estado: string): void {
    const msg = `¿Estás seguro de que deseas cambiar el estado del usuario "${usr.nombres}" a ${estado}?`;
    
    this.uiService.confirm('Cambiar Estado Usuario', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.cambiarEstadoUsuario(usr.id, { estado }).subscribe({
          next: () => {
            this.uiService.showSuccess('Estado del usuario actualizado con éxito.');
            this.loadUsuarios();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.userForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = this.userForm.value;

    if (this.isEditMode()) {
      const payload = {
        email: formVal.email || '',
        nombres: formVal.nombres || '',
        apellidos: formVal.apellidos || '',
        carreraId: formVal.rol === 'ESTUDIANTE' && formVal.carreraId ? Number(formVal.carreraId) : undefined
      };

      this.adminService.actualizarUsuario(this.selectedId()!, payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Usuario actualizado con éxito.');
          this.closeForm();
          this.loadUsuarios();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      const payload = {
        email: formVal.email || '',
        password: formVal.password || '',
        nombres: formVal.nombres || '',
        apellidos: formVal.apellidos || '',
        rol: formVal.rol || 'ESTUDIANTE',
        carreraId: formVal.rol === 'ESTUDIANTE' && formVal.carreraId ? Number(formVal.carreraId) : undefined
      };

      this.adminService.crearUsuario(payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Usuario creado con éxito.');
          this.closeForm();
          this.loadUsuarios();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
