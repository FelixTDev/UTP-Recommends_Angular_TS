import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CursoDocenteResponse, CursoResponse, DocenteResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-curso-docente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  template: `
    <div class="admin-curso-docente">
      <!-- Header Row -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 text-start">
          <h1 class="h2 fw-bold text-dark-title">Asignaciones Curso - Docente</h1>
          <p class="text-muted-custom">Asigna docentes a cursos específicos y controla su disponibilidad para reseñas.</p>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0">
          <button class="btn-primary-glass px-4 py-2.5 rounded-pill shadow-sm" (click)="openCreateForm()">
            <i class="bi bi-plus-circle-fill me-2"></i>Nueva Asignación
          </button>
        </div>
      </div>

      <!-- Unified Filters Bar -->
      <div class="glass-card mb-4 p-3 search-filter-bar">
        <div class="row g-3 align-items-center">
          <!-- Text Search input -->
          <div class="col-md-8">
            <div class="search-input-group">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                class="form-control filter-search-input" 
                placeholder="Buscar por curso o docente asignado..."
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
          
          <!-- Status Filter -->
          <div class="col-md-4">
            <div class="d-flex align-items-center select-filter-container">
              <i class="bi bi-check-circle-fill filter-icon text-muted"></i>
              <select class="form-select filter-select" [(ngModel)]="filterEstado" (change)="loadAsignaciones()">
                <option value="">Todos los Estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Asignaciones Table (col-12) -->
      <div class="row">
        <div class="col-12">
          <div class="glass-card p-0 overflow-hidden shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 custom-admin-table">
                <thead>
                  <tr>
                    <th class="ps-4 py-3">Curso Académico</th>
                    <th>Docente Catedrático</th>
                    <th>Estado</th>
                    <th class="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredAsignaciones().length === 0) {
                    <tr>
                      <td colspan="4" class="text-center py-5 text-muted-custom">
                        <i class="bi bi-link-45deg d-block mb-2" style="font-size: 2.5rem; opacity: 0.3;"></i>
                        No se encontraron asignaciones que coincidan con la búsqueda.
                      </td>
                    </tr>
                  } @else {
                    @for (asig of filteredAsignaciones(); track asig.id) {
                      <tr>
                        <!-- Curso -->
                        <td class="ps-4 py-3 text-dark-title fw-bold text-start">{{ asig.curso }}</td>
                        <!-- Docente -->
                        <td class="text-start">{{ asig.docente }}</td>
                        <!-- Status -->
                        <td class="text-start">
                          @let status = (asig.estado | statusBadge);
                          <span class="badge-status" [ngClass]="'badge-status-' + asig.estado.toLowerCase()">
                            <span class="status-indicator"></span>
                            {{ status.label }}
                          </span>
                        </td>
                        <!-- Actions -->
                        <td class="text-end pe-4">
                          <!-- Activate/Deactivate Button -->
                          @if (asig.estado === 'ACTIVO') {
                            <button class="action-circle-btn deactivate-btn" (click)="toggleEstado(asig)" title="Desactivar Asignación">
                              <i class="bi bi-toggle-off"></i>
                            </button>
                          } @else {
                            <button class="action-circle-btn activate-btn" (click)="toggleEstado(asig)" title="Activar Asignación">
                              <i class="bi bi-toggle-on"></i>
                            </button>
                          }
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
                <i class="bi bi-link-45deg"></i>
                Registrar Nueva Asignación
              </h2>
              <button class="btn-close-modal" (click)="closeForm()"><i class="bi bi-x-lg"></i></button>
            </div>

            <!-- Modal Content Form -->
            <div class="premium-modal-body">
              <form [formGroup]="assignForm" (ngSubmit)="onSubmit()">
                <!-- Course select -->
                <div class="glass-form-group mb-3 text-start">
                  <label class="glass-form-label">Curso Académico</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-book-fill input-icon"></i>
                    <select 
                      class="glass-input select-arrow ps-5" 
                      formControlName="cursoId"
                      [class.is-invalid]="submitted() && f['cursoId'].errors"
                    >
                      <option value="">Selecciona el curso...</option>
                      @for (c of activeCursos(); track c.id) {
                        <option [value]="c.id">{{ c.nombre }} ({{ c.tipo === 'GENERAL' ? 'Estudios Generales' : 'Especifico de Carrera' }})</option>
                      }
                    </select>
                  </div>
                  @if (submitted() && f['cursoId'].errors) {
                    <div class="error-feedback text-danger small mt-1">Debe seleccionar un curso académico.</div>
                  }
                </div>

                <!-- Teacher select -->
                <div class="glass-form-group mb-4 text-start">
                  <label class="glass-form-label">Docente Catedrático</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-person-badge-fill input-icon"></i>
                    <select 
                      class="glass-input select-arrow ps-5" 
                      formControlName="docenteId"
                      [class.is-invalid]="submitted() && f['docenteId'].errors"
                    >
                      <option value="">Selecciona el docente...</option>
                      @for (d of activeDocentes(); track d.id) {
                        <option [value]="d.id">{{ d.nombres }} {{ d.apellidos }}</option>
                      }
                    </select>
                  </div>
                  @if (submitted() && f['docenteId'].errors) {
                    <div class="error-feedback text-danger small mt-1">Debe seleccionar un docente.</div>
                  }
                </div>

                <!-- Action Button Footer inside form -->
                <div class="premium-modal-footer d-flex gap-3 justify-content-end mt-4 pt-3 border-top border-light-subtle">
                  <button type="button" class="btn-cancel-modal py-2 px-4" (click)="closeForm()">Cancelar</button>
                  <button type="submit" class="btn-primary-glass py-2 px-5 rounded-pill shadow-sm" [disabled]="isLoadingForm()">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" [class.d-none]="!isLoadingForm()"></span>
                    Asignar
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
    .admin-curso-docente {
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
    
    .deactivate-btn:hover:not(:disabled) {
      border-color: rgba(220, 38, 38, 0.3);
      background: rgba(220, 38, 38, 0.05);
      color: #dc2626;
    }
    .activate-btn:hover:not(:disabled) {
      border-color: rgba(5, 150, 105, 0.3);
      background: rgba(5, 150, 105, 0.05);
      color: #059669;
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
      max-width: 520px;
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

  // Filters state
  readonly searchTerm = signal<string>('');
  filterEstado = '';

  // Reactively filter assignments
  readonly filteredAsignaciones = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.asignaciones();
    if (!term) return list;
    return list.filter(a => 
      a.curso.toLowerCase().includes(term) || 
      a.docente.toLowerCase().includes(term)
    );
  });

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
      next: (res) => {
        let result = res;
        if (this.filterEstado) {
          result = result.filter(a => a.estado === this.filterEstado);
        }
        this.asignaciones.set(result);
      },
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
