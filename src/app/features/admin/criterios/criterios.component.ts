import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CriterioResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-criterios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe],
  template: `
    <div class="admin-criterios">
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <h1 class="h2 fw-bold text-white">Gestionar Criterios de Calificación</h1>
          <p class="text-muted-custom">Agrega o modifica los criterios con los que los estudiantes evalúan a los docentes.</p>
        </div>
        <div class="col-md-4 text-md-end">
          <button class="btn-primary-glass" (click)="openCreateForm()">
            <i class="bi bi-plus-circle me-2"></i>Nuevo Criterio
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
                    <th>Descripción</th>
                    <th>Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (crit of criterios(); track crit.id) {
                    <tr>
                      <td class="text-white fw-bold">{{ crit.nombre }}</td>
                      <td class="text-muted-custom">{{ crit.descripcion || 'Sin descripción' }}</td>
                      <td>
                        @let status = (crit.estado | statusBadge);
                        <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-info me-2" (click)="openEditForm(crit)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                          class="btn btn-sm" 
                          [class.btn-outline-danger]="crit.estado === 'ACTIVO'"
                          [class.btn-outline-success]="crit.estado === 'INACTIVO'"
                          (click)="toggleEstado(crit)" 
                          [title]="crit.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'"
                        >
                          <i class="bi" [class.bi-toggle-on]="crit.estado === 'ACTIVO'" [class.bi-toggle-off]="crit.estado === 'INACTIVO'"></i>
                        </button>
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
                  {{ isEditMode() ? 'Editar Criterio' : 'Nuevo Criterio' }}
                </h2>
                <button class="btn-close btn-close-white" (click)="closeForm()"></button>
              </div>

              <form [formGroup]="criterioForm" (ngSubmit)="onSubmit()">
                <!-- Name -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Nombre del Criterio</label>
                  <input 
                    type="text" 
                    class="glass-input" 
                    placeholder="Ej: Puntualidad, Claridad..."
                    formControlName="nombre"
                    [class.is-invalid]="submitted() && f['nombre'].errors"
                  />
                  @if (submitted() && f['nombre'].errors) {
                    <div class="invalid-feedback">El nombre es requerido.</div>
                  }
                </div>

                <!-- Description -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Descripción</label>
                  <textarea 
                    class="glass-input" 
                    rows="4" 
                    placeholder="Explica qué evalúa este criterio para guiar al estudiante..."
                    formControlName="descripcion"
                  ></textarea>
                </div>

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
    .admin-criterios {
      color: var(--text-primary);
    }
  `]
})
export class CriteriosComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly criterios = signal<CriterioResponse[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  readonly criterioForm = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['']
  });

  get f() { return this.criterioForm.controls; }

  ngOnInit(): void {
    this.loadCriterios();
  }

  loadCriterios(): void {
    this.adminService.listarCriterios().subscribe({
      next: (res) => this.criterios.set(res),
      error: () => this.uiService.showError('No se pudieron cargar los criterios.')
    });
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.criterioForm.reset();
    this.submitted.set(false);
  }

  openEditForm(crit: CriterioResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(crit.id);
    this.criterioForm.patchValue({
      nombre: crit.nombre,
      descripcion: crit.descripcion || ''
    });
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.criterioForm.reset();
  }

  toggleEstado(crit: CriterioResponse): void {
    const nuevoEstado = crit.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const msg = `¿Estás seguro de que deseas cambiar el estado del criterio "${crit.nombre}" a ${nuevoEstado}?`;
    
    this.uiService.confirm('Cambiar Estado', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.cambiarEstadoCriterio(crit.id, { estado: nuevoEstado }).subscribe({
          next: () => {
            this.uiService.showSuccess('Estado del criterio actualizado con éxito.');
            this.loadCriterios();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.criterioForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = {
      nombre: this.criterioForm.value.nombre || '',
      descripcion: this.criterioForm.value.descripcion || undefined
    };

    if (this.isEditMode()) {
      this.adminService.actualizarCriterio(this.selectedId()!, formVal).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Criterio actualizado con éxito.');
          this.closeForm();
          this.loadCriterios();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      this.adminService.crearCriterio(formVal).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Criterio creado con éxito.');
          this.closeForm();
          this.loadCriterios();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
