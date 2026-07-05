import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PublicService } from '../../../core/services/public.service';
import { CursoResponse, CarreraResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  template: `
    <div class="admin-cursos">
      <!-- Header Row -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 text-start">
          <h1 class="h2 fw-bold text-dark-title">Gestionar Cursos</h1>
          <p class="text-muted-custom">Administra los cursos de estudios generales y específicos de carrera.</p>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0">
          <button class="btn-primary-glass px-4 py-2.5 rounded-pill shadow-sm" (click)="openCreateForm()">
            <i class="bi bi-plus-circle-fill me-2"></i>Nuevo Curso
          </button>
        </div>
      </div>

      <!-- Unified Filters Bar -->
      <div class="glass-card mb-4 p-3 search-filter-bar">
        <div class="row g-3 align-items-center">
          <!-- Text Search input -->
          <div class="col-lg-5 col-md-4">
            <div class="search-input-group">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                class="form-control filter-search-input" 
                placeholder="Buscar por nombre de curso..."
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
              />
              @if (searchTerm()) {
                <button class="btn-clear-search" (click)="searchTerm.set('')">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              }
            </div>
          </div>
          
          <!-- Tipo Filter -->
          <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="d-flex align-items-center select-filter-container">
              <i class="bi bi-tag-fill filter-icon text-muted"></i>
              <select class="form-select filter-select" [(ngModel)]="filterTipo" (change)="loadCursos()">
                <option value="">Todos los Tipos</option>
                <option value="GENERAL">Estudios Generales</option>
                <option value="CARRERA">Especifico de Carrera</option>
              </select>
            </div>
          </div>

          <!-- Carrera Filter -->
          <div class="col-lg-4 col-md-4 col-sm-6">
            <div class="d-flex align-items-center select-filter-container">
              <i class="bi bi-mortarboard-fill filter-icon text-muted"></i>
              <select class="form-select filter-select" [(ngModel)]="filterCarreraId" (change)="loadCursos()">
                <option value="">Todas las Carreras</option>
                @for (carrera of carreras(); track carrera.id) {
                  <option [value]="carrera.id">{{ carrera.nombre }}</option>
                }
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Cursos Table (col-12) -->
      <div class="row">
        <div class="col-12">
          <div class="glass-card p-0 overflow-hidden shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 custom-admin-table">
                <thead>
                  <tr>
                    <th class="ps-4 py-3">Nombre del Curso</th>
                    <th>Tipo</th>
                    <th>Carrera Universitaria</th>
                    <th>Estado</th>
                    <th class="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredCursos().length === 0) {
                    <tr>
                      <td colspan="5" class="text-center py-5 text-muted-custom">
                        <i class="bi bi-book d-block mb-2" style="font-size: 2.5rem; opacity: 0.3;"></i>
                        No se encontraron cursos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  } @else {
                    @for (curso of filteredCursos(); track curso.id) {
                      <tr>
                        <!-- Name -->
                        <td class="ps-4 py-3 text-dark-title fw-bold text-start">{{ curso.nombre }}</td>
                        <!-- Tipo -->
                        <td class="text-start">
                          <span class="badge-role" [class.admin-role]="curso.tipo === 'CARRERA'" [class.student-role]="curso.tipo === 'GENERAL'">
                            {{ curso.tipo === 'CARRERA' ? 'Carrera' : 'General' }}
                          </span>
                        </td>
                        <!-- Carrera -->
                        <td class="text-muted-custom small text-start">
                          {{ getCarreraNombre(curso.carreraId) }}
                        </td>
                        <!-- Status -->
                        <td class="text-start">
                          @let status = (curso.estado | statusBadge);
                          <span class="badge-status" [ngClass]="'badge-status-' + curso.estado.toLowerCase()">
                            <span class="status-indicator"></span>
                            {{ status.label }}
                          </span>
                        </td>
                        <!-- Actions -->
                        <td class="text-end pe-4">
                          <div class="action-buttons-group d-inline-flex gap-2">
                            <!-- Edit Button -->
                            <button class="action-circle-btn edit-btn" (click)="openEditForm(curso)" title="Editar">
                              <i class="bi bi-pencil-fill"></i>
                            </button>
                            <!-- Inactivate Button -->
                            @if (curso.estado === 'ACTIVO') {
                              <button class="action-circle-btn deactivate-btn" (click)="inactivarCurso(curso)" title="Inactivar Curso">
                                <i class="bi bi-toggle-off"></i>
                              </button>
                            }
                          </div>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- PREMIUM GLASSMORPHISM MODAL BACKDROP & OVERLAY -->
      @if (showForm()) {
        <div class="premium-modal-backdrop" (click)="closeForm()">
          <div class="premium-modal-dialog" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="premium-modal-header d-flex justify-content-between align-items-center">
              <h2 class="h5 fw-bold text-dark-title mb-0">
                <i class="bi" [class.bi-book-fill]="!isEditMode()" [class.bi-pencil-fill]="isEditMode()"></i>
                {{ isEditMode() ? 'Editar Datos de Curso' : 'Registrar Nuevo Curso' }}
              </h2>
              <button class="btn-close-modal" (click)="closeForm()"><i class="bi bi-x-lg"></i></button>
            </div>

            <!-- Modal Content Form -->
            <div class="premium-modal-body">
              <form [formGroup]="cursoForm" (ngSubmit)="onSubmit()">
                <!-- Curso Name input -->
                <div class="glass-form-group mb-3 text-start">
                  <label class="glass-form-label">Nombre del Curso</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-bookmark-fill input-icon"></i>
                    <input 
                      type="text" 
                      class="glass-input ps-5" 
                      placeholder="Ej: Análisis de Algoritmos, Física General..."
                      formControlName="nombre"
                      [class.is-invalid]="submitted() && f['nombre'].errors"
                    />
                  </div>
                  @if (submitted() && f['nombre'].errors) {
                    <div class="error-feedback text-danger small mt-1">El nombre del curso es obligatorio.</div>
                  }
                </div>

                <!-- Tipo select -->
                <div class="glass-form-group mb-3 text-start">
                  <label class="glass-form-label">Tipo de Curso</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-tag-fill input-icon"></i>
                    <select 
                      class="glass-input select-arrow ps-5" 
                      formControlName="tipo"
                      [class.is-invalid]="submitted() && f['tipo'].errors"
                    >
                      <option value="GENERAL">Estudios Generales (GENERAL)</option>
                      <option value="CARRERA">Específico de Carrera (CARRERA)</option>
                    </select>
                  </div>
                </div>

                <!-- Carrera Select (Conditional) -->
                @if (showCarreraSelect()) {
                  <div class="glass-form-group mb-4 text-start">
                    <label class="glass-form-label">Carrera Perteneciente</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-mortarboard-fill input-icon"></i>
                      <select 
                        class="glass-input select-arrow ps-5" 
                        formControlName="carreraId"
                        [class.is-invalid]="submitted() && f['carreraId'].errors"
                      >
                        <option value="">Selecciona la carrera profesional...</option>
                        @for (carrera of carreras(); track carrera.id) {
                          <option [value]="carrera.id">{{ carrera.nombre }}</option>
                        }
                      </select>
                    </div>
                    @if (submitted() && f['carreraId'].errors) {
                      <div class="error-feedback text-danger small mt-1">Carrera profesional requerida para cursos específicos.</div>
                    }
                  </div>
                }

                <!-- Action Button Footer inside form -->
                <div class="premium-modal-footer d-flex gap-3 justify-content-end mt-4 pt-3 border-top border-light-subtle">
                  <button type="button" class="btn-cancel-modal py-2 px-4" (click)="closeForm()">Cancelar</button>
                  <button type="submit" class="btn-primary-glass py-2 px-5 rounded-pill shadow-sm" [disabled]="isLoadingForm()">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" [class.d-none]="!isLoadingForm()"></span>
                    {{ isEditMode() ? 'Guardar Cambios' : 'Registrar Curso' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-cursos {
      color: var(--text-primary);
    }
    .text-dark-title {
      color: #0f172a !important;
    }
    
    /* Unified Search/Filter Bar */
    .search-filter-bar {
      border: 1px solid var(--utp-border);
      background: rgba(255, 255, 255, 0.85);
      border-radius: 18px;
    }
    .search-input-group {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 16px;
      color: #94a3b8;
      font-size: 1.05rem;
    }
    .filter-search-input {
      padding: 10px 45px;
      font-size: 0.88rem;
      border: 1px solid var(--utp-border);
      border-radius: 12px;
      background: #ffffff;
      color: #0f172a;
      transition: all 0.2s ease;
      width: 100%;
    }
    .filter-search-input:focus {
      border-color: rgba(255, 23, 68, 0.4);
      box-shadow: 0 0 0 4px rgba(255, 23, 68, 0.08);
      background: #ffffff;
    }
    .btn-clear-search {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      color: #94a3b8;
      padding: 0;
      display: flex;
      align-items: center;
      transition: color 0.2s ease;
      cursor: pointer;
    }
    .btn-clear-search:hover {
      color: var(--utp-primary);
    }
    
    .select-filter-container {
      position: relative;
      width: 100%;
    }
    .filter-icon {
      position: absolute;
      left: 14px;
      font-size: 0.9rem;
      pointer-events: none;
    }
    .filter-select {
      padding: 10px 14px 10px 38px;
      font-size: 0.88rem;
      border: 1px solid var(--utp-border);
      border-radius: 12px;
      background-color: #ffffff;
      color: #0f172a;
      cursor: pointer;
      width: 100%;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 14px center;
      background-size: 12px 10px;
    }
    .filter-select:focus {
      border-color: rgba(255, 23, 68, 0.4);
      box-shadow: 0 0 0 4px rgba(255, 23, 68, 0.08);
    }
    
    /* Table styling */
    .custom-admin-table {
      background: rgba(255, 255, 255, 0.85);
    }
    .custom-admin-table th {
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(0, 0, 0, 0.01);
      border-bottom: 2px solid var(--utp-border);
      color: #475569;
      padding-top: 16px;
      padding-bottom: 16px;
    }
    .custom-admin-table td {
      border-bottom: 1px solid var(--utp-border-soft);
      padding-top: 14px;
      padding-bottom: 14px;
      font-size: 0.9rem;
    }
    .custom-admin-table tbody tr:hover {
      background-color: rgba(255, 23, 68, 0.015) !important;
    }
    
    /* Badges type */
    .badge-role {
      display: inline-block;
      padding: 4px 10px;
      font-size: 0.78rem;
      font-weight: 700;
      border-radius: 30px;
    }
    .student-role {
      background: rgba(2, 132, 199, 0.06);
      color: #0284c7;
      border: 1px solid rgba(2, 132, 199, 0.12);
    }
    .admin-role {
      background: rgba(124, 58, 237, 0.06);
      color: #7c3aed;
      border: 1px solid rgba(124, 58, 237, 0.12);
    }
    
    /* Badges status */
    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      font-size: 0.78rem;
      font-weight: 700;
      border-radius: 30px;
    }
    .badge-status-activo {
      background: rgba(5, 150, 105, 0.06);
      color: #059669;
      border: 1px solid rgba(5, 150, 105, 0.12);
    }
    .badge-status-activo .status-indicator { background-color: #059669; }
    
    .badge-status-inactivo {
      background: rgba(107, 114, 128, 0.06);
      color: #4b5563;
      border: 1px solid rgba(107, 114, 128, 0.12);
    }
    .badge-status-inactivo .status-indicator { background-color: #4b5563; }
    
    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }
    
    /* Action circular buttons */
    .action-circle-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--utp-border);
      background: #ffffff;
      color: #64748b;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .action-circle-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed !important;
    }
    
    .edit-btn:hover:not(:disabled) {
      border-color: rgba(2, 132, 199, 0.3);
      background: rgba(2, 132, 199, 0.05);
      color: #0284c7;
    }
    .deactivate-btn:hover:not(:disabled) {
      border-color: rgba(220, 38, 38, 0.3);
      background: rgba(220, 38, 38, 0.05);
      color: #dc2626;
    }
    
    /* MODAL DESIGN */
    .premium-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(8px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }
    .premium-modal-dialog {
      background: rgba(255, 255, 255, 0.95);
      border-top: 5px solid var(--utp-primary);
      border-radius: 20px;
      width: 100%;
      max-width: 540px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      margin: 15px;
      overflow: hidden;
    }
    .premium-modal-header {
      padding: 22px 28px 16px;
      border-bottom: 1px solid var(--utp-border-soft);
    }
    .btn-close-modal {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.1rem;
      transition: color 0.2s ease;
      cursor: pointer;
    }
    .btn-close-modal:hover {
      color: var(--utp-primary);
    }
    .premium-modal-body {
      padding: 24px 28px 28px;
    }
    
    /* Form inputs */
    .glass-form-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 6px;
      display: block;
    }
    .input-icon-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 18px;
      color: #94a3b8;
      font-size: 1rem;
      pointer-events: none;
    }
    .glass-input {
      width: 100%;
      padding: 11px 18px;
      font-size: 0.88rem;
      border: 1px solid var(--utp-border);
      border-radius: 10px;
      background: #ffffff;
      color: #0f172a;
      transition: all 0.2s ease;
    }
    .glass-input:focus {
      border-color: rgba(255, 23, 68, 0.4);
      box-shadow: 0 0 0 4px rgba(255, 23, 68, 0.08);
      outline: none;
    }
    .glass-input.select-arrow {
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 18px center;
      background-size: 12px 10px;
    }
    
    .btn-cancel-modal {
      background: none;
      border: 1px solid var(--utp-border);
      border-radius: 30px;
      color: #475569;
      font-size: 0.88rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .btn-cancel-modal:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #cbd5e1;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: scale(0.95) translateY(10px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
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

  // Filters state
  readonly searchTerm = signal<string>('');
  filterTipo = '';
  filterCarreraId = '';

  // Reactively filter courses list
  readonly filteredCursos = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    let list = this.cursos();

    // Client-side filtering by search term
    if (term) {
      list = list.filter(c => c.nombre.toLowerCase().includes(term));
    }

    return list;
  });

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
    // If filters are active, we can apply them dynamically
    this.adminService.listarCursos().subscribe({
      next: (res) => {
        let result = res;
        
        // Filter by Tipo
        if (this.filterTipo) {
          result = result.filter(c => c.tipo === this.filterTipo);
        }
        
        // Filter by Carrera
        if (this.filterCarreraId) {
          result = result.filter(c => c.carreraId === Number(this.filterCarreraId));
        }
        
        this.cursos.set(result);
      },
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
    
    const payload = {
      nombre: formVal.nombre || '',
      tipo: formVal.tipo || 'GENERAL',
      carreraId: formVal.tipo === 'CARRERA' && formVal.carreraId ? Number(formVal.carreraId) : undefined,
      estado: 'ACTIVO'
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
