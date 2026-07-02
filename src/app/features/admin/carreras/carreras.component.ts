import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CarreraResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-carreras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe],
  template: `
    <div class="admin-carreras">
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <h1 class="h2 fw-bold text-white">Gestionar Carreras Profesionales</h1>
          <p class="text-muted-custom">Administra las carreras universitarias de la UTP en el sistema.</p>
        </div>
        <div class="col-md-4 text-md-end">
          <button class="btn-primary-glass" (click)="openCreateForm()">
            <i class="bi bi-plus-circle me-2"></i>Nueva Carrera
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
                    <th>ID</th>
                    <th>Nombre de la Carrera</th>
                    <th>Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (carrera of carreras(); track carrera.id) {
                    <tr>
                      <td class="text-muted-custom font-monospace">#{{ carrera.id }}</td>
                      <td class="text-white fw-bold">{{ carrera.nombre }}</td>
                      <td>
                        @let status = (carrera.estado | statusBadge);
                        <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-info me-2" (click)="openEditForm(carrera)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        @if (carrera.estado === 'ACTIVA') {
                          <button class="btn btn-sm btn-outline-danger" (click)="inactivarCarrera(carrera)" title="Inactivar">
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
                  {{ isEditMode() ? 'Editar Carrera' : 'Nueva Carrera' }}
                </h2>
                <button class="btn-close btn-close-white" (click)="closeForm()"></button>
              </div>

              <form [formGroup]="carreraForm" (ngSubmit)="onSubmit()">
                <!-- Name -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Nombre de la Carrera</label>
                  <input 
                    type="text" 
                    class="glass-input" 
                    placeholder="Ej: Ingeniería de Sistemas, Psicología..."
                    formControlName="nombre"
                    [class.is-invalid]="submitted() && f['nombre'].errors"
                  />
                  @if (submitted() && f['nombre'].errors) {
                    <div class="invalid-feedback">El nombre es requerido.</div>
                  }
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
    .admin-carreras {
      color: var(--text-primary);
    }
  `]
})
export class CarrerasComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly carreras = signal<CarreraResponse[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  readonly carreraForm = this.fb.group({
    nombre: ['', [Validators.required]]
  });

  get f() { return this.carreraForm.controls; }

  ngOnInit(): void {
    this.loadCarreras();
  }

  loadCarreras(): void {
    this.adminService.listarCarreras().subscribe({
      next: (res) => this.carreras.set(res),
      error: () => this.uiService.showError('No se pudieron cargar las carreras.')
    });
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.carreraForm.reset();
    this.submitted.set(false);
  }

  openEditForm(carrera: CarreraResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(carrera.id);
    this.carreraForm.patchValue({
      nombre: carrera.nombre
    });
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.carreraForm.reset();
  }

  inactivarCarrera(carrera: CarreraResponse): void {
    const msg = `¿Estás seguro de que deseas inactivar la carrera profesional "${carrera.nombre}"?`;
    
    this.uiService.confirm('Inactivar Carrera', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.inactivarCarrera(carrera.id).subscribe({
          next: () => {
            this.uiService.showSuccess('Carrera inactivada con éxito.');
            this.loadCarreras();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.carreraForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = {
      nombre: this.carreraForm.value.nombre || ''
    };

    if (this.isEditMode()) {
      this.adminService.actualizarCarrera(this.selectedId()!, formVal).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Carrera actualizada con éxito.');
          this.closeForm();
          this.loadCarreras();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      this.adminService.crearCarrera(formVal).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Carrera creada con éxito.');
          this.closeForm();
          this.loadCarreras();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
