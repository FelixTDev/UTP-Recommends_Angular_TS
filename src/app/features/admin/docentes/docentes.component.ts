import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DocenteResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe],
  template: `
    <div class="admin-docentes">
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <h1 class="h2 fw-bold text-white">Gestionar Docentes</h1>
          <p class="text-muted-custom">Administra la información de los profesores de la institución.</p>
        </div>
        <div class="col-md-4 text-md-end">
          <button class="btn-primary-glass" (click)="openCreateForm()">
            <i class="bi bi-plus-circle me-2"></i>Nuevo Docente
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
                    <th>Docente</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th class="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (doc of docentes(); track doc.id) {
                    <tr>
                      <td class="text-white fw-bold">{{ doc.nombres }} {{ doc.apellidos }}</td>
                      <td class="text-muted-custom">{{ doc.email || 'Sin correo registrado' }}</td>
                      <td>
                        @let status = (doc.estado | statusBadge);
                        <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                      </td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-info me-2" (click)="openEditForm(doc)" title="Editar">
                          <i class="bi bi-pencil"></i>
                        </button>
                        @if (doc.estado === 'ACTIVO') {
                          <button class="btn btn-sm btn-outline-danger" (click)="inactivarDocente(doc)" title="Inactivar">
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
                  {{ isEditMode() ? 'Editar Docente' : 'Nuevo Docente' }}
                </h2>
                <button class="btn-close btn-close-white" (click)="closeForm()"></button>
              </div>

              <form [formGroup]="docenteForm" (ngSubmit)="onSubmit()">
                <!-- Names -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Nombres</label>
                  <input 
                    type="text" 
                    class="glass-input" 
                    placeholder="Ej: Carlos"
                    formControlName="nombres"
                    [class.is-invalid]="submitted() && f['nombres'].errors"
                  />
                  @if (submitted() && f['nombres'].errors) {
                    <div class="invalid-feedback">Nombres son obligatorios (solo letras).</div>
                  }
                </div>

                <!-- Lastnames -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Apellidos</label>
                  <input 
                    type="text" 
                    class="glass-input" 
                    placeholder="Ej: Pérez Quispe"
                    formControlName="apellidos"
                    [class.is-invalid]="submitted() && f['apellidos'].errors"
                  />
                  @if (submitted() && f['apellidos'].errors) {
                    <div class="invalid-feedback">Apellidos son obligatorios (solo letras).</div>
                  }
                </div>

                <!-- Email -->
                <div class="glass-form-group">
                  <label class="glass-form-label">Correo Electrónico (Opcional)</label>
                  <input 
                    type="email" 
                    class="glass-input" 
                    placeholder="Ej: cperez@utp.edu.pe"
                    formControlName="email"
                    [class.is-invalid]="submitted() && f['email'].errors"
                  />
                  @if (submitted() && f['email'].errors) {
                    <div class="invalid-feedback">Formato de correo electrónico inválido.</div>
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
    .admin-docentes {
      color: var(--text-primary);
    }
  `]
})
export class DocentesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly docentes = signal<DocenteResponse[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  readonly docenteForm = this.fb.group({
    nombres: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    email: ['', [Validators.email]]
  });

  get f() { return this.docenteForm.controls; }

  ngOnInit(): void {
    this.loadDocentes();
  }

  loadDocentes(): void {
    this.adminService.listarDocentes().subscribe({
      next: (res) => this.docentes.set(res),
      error: () => this.uiService.showError('No se pudieron cargar los docentes.')
    });
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.docenteForm.reset();
    this.submitted.set(false);
  }

  openEditForm(doc: DocenteResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(doc.id);
    this.docenteForm.patchValue({
      nombres: doc.nombres,
      apellidos: doc.apellidos,
      email: doc.email || ''
    });
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.docenteForm.reset();
  }

  inactivarDocente(doc: DocenteResponse): void {
    const msg = `¿Estás seguro de que deseas inactivar el docente "${doc.nombres} ${doc.apellidos}"?`;
    
    this.uiService.confirm('Inactivar Docente', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.inactivarDocente(doc.id).subscribe({
          next: () => {
            this.uiService.showSuccess('Docente inactivado con éxito (soft-delete aplicado si tiene reseñas).');
            this.loadDocentes();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.docenteForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = this.docenteForm.value;
    const payload = {
      nombres: formVal.nombres || '',
      apellidos: formVal.apellidos || '',
      email: formVal.email || undefined
    };

    if (this.isEditMode()) {
      this.adminService.actualizarDocente(this.selectedId()!, payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Docente actualizado con éxito.');
          this.closeForm();
          this.loadDocentes();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      this.adminService.crearDocente(payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Docente creado con éxito.');
          this.closeForm();
          this.loadDocentes();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
