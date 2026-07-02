import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PublicService } from '../../../core/services/public.service';
import { CursoResponse, CarreraResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe],
  template: `
    <div class="admin-cursos">
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <h1 class="h2 fw-bold text-white">Gestionar Cursos</h1>
          <p class="text-muted-custom">Administra los cursos de estudios generales y específicos de carrera.</p>
        </div>
        <div class="col-md-4 text-md-end">
          <button class="btn-primary-glass" (click)="openCreateForm()">
            <i class="bi bi-plus-circle me-2"></i>Nuevo Curso
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
                    <th>Tipo</th>
                    <th>Carrera</th>
                    <th>Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (curso of cursos(); track curso.id) {
                    <tr>
                      <td class="text-white fw-bold">{{ curso.nombre }}</td>
                      <td>
                        @let typeBadge = (curso.tipo | statusBadge);
                        <span class="badge-badge" [class]="typeBadge.class">{{ typeBadge.label }}</span>
                      </td>
                      <td class="text-muted-custom">
                        {{ getCarreraNombre(curso.carreraId) }}
                      </td>
                      <td>
                        @let status = (curso.estado | statusBadge);
                        <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-info me-2" (click)="openEditForm(curso)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        @if (curso.estado === 'ACTIVO') {
                          <button class="btn btn-sm btn-outline-danger" (click)="inactivarCurso(curso)" title="Inactivar">
                            <i class="bi bi-trash"></i>
                          </button>
                        }
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
                  {{ isEditMode() ? 'Editar Curso' : 'Nuevo Curso' }}
                </h2>
                <button class="btn-close btn-close-white" (click)="closeForm()"></button>
              </div>

              <form [formGroup]="cursoForm" (ngSubmit)="onSubmit()">
                <!-- Name -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Nombre del Curso</label>
                  <input 
                    type="text" 
                    class="glass-input" 
                    placeholder="Ej: Matemática I, Estructura de Datos..."
                    formControlName="nombre"
                    [class.is-invalid]="submitted() && f['nombre'].errors"
                  />
                  @if (submitted() && f['nombre'].errors) {
                    <div class="invalid-feedback">El nombre es requerido.</div>
                  }
                </div>

                <!-- Tipo -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Tipo de Curso</label>
                  <select 
                    class="glass-input" 
                    formControlName="tipo"
                    [class.is-invalid]="submitted() && f['tipo'].errors"
                  >
                    <option value="GENERAL">Estudios Generales (GENERAL)</option>
                    <option value="CARRERA">Específico de Carrera (CARRERA)</option>
                  </select>
                  @if (submitted() && f['tipo'].errors) {
                    <div class="invalid-feedback">Tipo de curso es requerido.</div>
                  }
                </div>

                <!-- Carrera Select (Conditional) -->
                @if (showCarreraSelect()) {
                  <div class="glass-form-group">
                    <label class="glass-form-label">Carrera Perteneciente</label>
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
                      <div class="invalid-feedback">Carrera es requerida para cursos específicos.</div>
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
    .admin-cursos {
      color: var(--text-primary);
    }
  `]
})
export class CursosComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly cursos = signal<CursoResponse[]>([]);
  readonly carreras = signal<CarreraResponse[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  
  readonly showCarreraSelect = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  readonly cursoForm = this.fb.group({
    nombre: ['', [Validators.required]],
    tipo: ['GENERAL', [Validators.required]],
    carreraId: ['']
  });

  get f() { return this.cursoForm.controls; }

  ngOnInit(): void {
    this.loadCursos();
    this.loadCarreras();
    
    // Watch Tipo changes to toggle and validate Carrera Select
    this.cursoForm.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.updateCarreraValidation(tipo || 'GENERAL');
    });
  }

  loadCursos(): void {
    this.adminService.listarCursos().subscribe({
      next: (res) => this.cursos.set(res),
      error: () => this.uiService.showError('No se pudieron cargar los cursos.')
    });
  }

  loadCarreras(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res)
    });
  }

  updateCarreraValidation(tipo: string): void {
    const carreraCtrl = this.cursoForm.get('carreraId');
    if (tipo === 'CARRERA') {
      this.showCarreraSelect.set(true);
      carreraCtrl?.setValidators([Validators.required]);
    } else {
      this.showCarreraSelect.set(false);
      carreraCtrl?.clearValidators();
      carreraCtrl?.setValue('');
    }
    carreraCtrl?.updateValueAndValidity();
  }

  getCarreraNombre(carreraId?: number): string {
    if (!carreraId) return 'Estudios Generales';
    const c = this.carreras().find(item => item.id === carreraId);
    return c ? c.nombre : `Carrera ID: ${carreraId}`;
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.cursoForm.reset({ tipo: 'GENERAL' });
    this.updateCarreraValidation('GENERAL');
    this.submitted.set(false);
  }

  openEditForm(curso: CursoResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(curso.id);
    this.cursoForm.patchValue({
      nombre: curso.nombre,
      tipo: curso.tipo,
      carreraId: curso.carreraId ? curso.carreraId.toString() : ''
    });
    this.updateCarreraValidation(curso.tipo);
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.cursoForm.reset();
  }

  inactivarCurso(curso: CursoResponse): void {
    const msg = `¿Estás seguro de que deseas inactivar el curso "${curso.nombre}"?`;
    
    this.uiService.confirm('Inactivar Curso', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.inactivarCurso(curso.id).subscribe({
          next: () => {
            this.uiService.showSuccess('Curso inactivado con éxito.');
            this.loadCursos();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.cursoForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = this.cursoForm.value;
    
    // Business rules: general courses force carreraId to null
    const payload = {
      nombre: formVal.nombre || '',
      tipo: formVal.tipo || 'GENERAL',
      carreraId: formVal.tipo === 'CARRERA' && formVal.carreraId ? Number(formVal.carreraId) : undefined,
      estado: 'ACTIVO' // Initial creation defaults to active
    };

    if (this.isEditMode()) {
      this.adminService.actualizarCurso(this.selectedId()!, payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Curso actualizado con éxito.');
          this.closeForm();
          this.loadCursos();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      this.adminService.crearCurso(payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Curso creado con éxito.');
          this.closeForm();
          this.loadCursos();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
