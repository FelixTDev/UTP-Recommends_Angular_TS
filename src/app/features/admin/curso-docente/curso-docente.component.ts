import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CursoDocenteResponse, CursoResponse, DocenteResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-curso-docente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe],
  template: `
    <div class="admin-curso-docente">
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <h1 class="h2 fw-bold text-white">Asignaciones Curso - Docente</h1>
          <p class="text-muted-custom">Asigna docentes a cursos específicos y controla su disponibilidad para reseñas.</p>
        </div>
        <div class="col-md-4 text-md-end">
          <button class="btn-primary-glass" (click)="openCreateForm()">
            <i class="bi bi-plus-circle me-2"></i>Nueva Asignación
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
                    <th>Curso</th>
                    <th>Docente</th>
                    <th>Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (asig of asignaciones(); track asig.id) {
                    <tr>
                      <td class="text-white fw-bold">{{ asig.curso }}</td>
                      <td>{{ asig.docente }}</td>
                      <td>
                        @let status = (asig.estado | statusBadge);
                        <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                      </td>
                      <td class="text-end">
                        <button 
                          class="btn btn-sm" 
                          [class.btn-outline-danger]="asig.estado === 'ACTIVO'"
                          [class.btn-outline-success]="asig.estado === 'INACTIVO'"
                          (click)="toggleEstado(asig)" 
                          [title]="asig.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'"
                        >
                          <i class="bi" [class.bi-toggle-on]="asig.estado === 'ACTIVO'" [class.bi-toggle-off]="asig.estado === 'INACTIVO'"></i>
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
                <h2 class="h5 fw-bold text-white mb-0">Nueva Asignación</h2>
                <button class="btn-close btn-close-white" (click)="closeForm()"></button>
              </div>

              <form [formGroup]="assignForm" (ngSubmit)="onSubmit()">
                <!-- Course -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Selecciona el Curso</label>
                  <select 
                    class="glass-input" 
                    formControlName="cursoId"
                    [class.is-invalid]="submitted() && f['cursoId'].errors"
                  >
                    <option value="">Seleccione curso...</option>
                    @for (c of activeCursos(); track c.id) {
                      <option [value]="c.id">{{ c.nombre }} ({{ c.tipo }})</option>
                    }
                  </select>
                  @if (submitted() && f['cursoId'].errors) {
                    <div class="invalid-feedback">El curso es requerido.</div>
                  }
                </div>

                <!-- Teacher -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Selecciona el Docente</label>
                  <select 
                    class="glass-input" 
                    formControlName="docenteId"
                    [class.is-invalid]="submitted() && f['docenteId'].errors"
                  >
                    <option value="">Seleccione docente...</option>
                    @for (d of activeDocentes(); track d.id) {
                      <option [value]="d.id">{{ d.nombres }} {{ d.apellidos }}</option>
                    }
                  </select>
                  @if (submitted() && f['docenteId'].errors) {
                    <div class="invalid-feedback">El docente es requerido.</div>
                  }
                </div>

                <!-- Submit buttons -->
                <div class="d-flex gap-2 justify-content-end mt-4">
                  <button type="button" class="btn-secondary-glass py-2" (click)="closeForm()">Cancelar</button>
                  <button type="submit" class="btn-primary-glass py-2" [disabled]="isLoadingForm()">Asignar</button>
                </div>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .admin-curso-docente {
      color: var(--text-primary);
    }
  `]
})
export class CursoDocenteComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly asignaciones = signal<CursoDocenteResponse[]>([]);
  readonly activeCursos = signal<CursoResponse[]>([]);
  readonly activeDocentes = signal<DocenteResponse[]>([]);
  
  readonly showForm = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  readonly assignForm = this.fb.group({
    cursoId: ['', [Validators.required]],
    docenteId: ['', [Validators.required]]
  });

  get f() { return this.assignForm.controls; }

  ngOnInit(): void {
    this.loadAsignaciones();
    this.loadActiveCatalogs();
  }

  loadAsignaciones(): void {
    this.adminService.listarAsignaciones().subscribe({
      next: (res) => this.asignaciones.set(res),
      error: () => this.uiService.showError('No se pudieron cargar las asignaciones.')
    });
  }

  loadActiveCatalogs(): void {
    this.adminService.listarCursos().subscribe({
      next: (res) => this.activeCursos.set(res.filter(c => c.estado === 'ACTIVO'))
    });
    this.adminService.listarDocentes().subscribe({
      next: (res) => this.activeDocentes.set(res.filter(d => d.estado === 'ACTIVO'))
    });
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.assignForm.reset();
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.assignForm.reset();
  }

  toggleEstado(asig: CursoDocenteResponse): void {
    const nuevoEstado = asig.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const msg = `¿Estás seguro de que deseas cambiar el estado de la asignación de "${asig.docente}" en "${asig.curso}" a ${nuevoEstado}?`;
    
    this.uiService.confirm('Cambiar Estado', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.cambiarEstadoAsignacion(asig.id, { estado: nuevoEstado }).subscribe({
          next: () => {
            this.uiService.showSuccess('Estado de la asignación actualizado con éxito.');
            this.loadAsignaciones();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.assignForm.invalid) return;

    this.isLoadingForm.set(true);
    const payload = {
      cursoId: Number(this.assignForm.value.cursoId),
      docenteId: Number(this.assignForm.value.docenteId),
      estado: 'ACTIVO'
    };

    this.adminService.crearAsignacion(payload).subscribe({
      next: () => {
        this.isLoadingForm.set(false);
        this.uiService.showSuccess('Asignación creada con éxito.');
        this.closeForm();
        this.loadAsignaciones();
      },
      error: () => this.isLoadingForm.set(false)
    });
  }
}
