import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DocenteResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  template: `
    <div class="admin-docentes">
      <!-- Header Row -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 text-start">
          <h1 class="h2 fw-bold text-dark-title">Gestionar Docentes</h1>
          <p class="text-muted-custom">Administra la información de los profesores de la institución.</p>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0">
          <button class="btn-primary-glass px-4 py-2.5 rounded-pill shadow-sm" (click)="openCreateForm()">
            <i class="bi bi-plus-circle-fill me-2"></i>Nuevo Docente
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
                placeholder="Buscar por nombre, apellido o correo..."
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
              <select class="form-select filter-select" [(ngModel)]="filterEstado" (change)="loadDocentes()">
                <option value="">Todos los Estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Docentes Table (col-12) -->
      <div class="row">
        <div class="col-12">
          <div class="glass-card p-0 overflow-hidden shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 custom-admin-table">
                <thead>
                  <tr>
                    <th class="ps-4 py-3">Docente (Nombre y Apellidos)</th>
                    <th>Correo Electrónico</th>
                    <th>Estado</th>
                    <th class="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredDocentes().length === 0) {
                    <tr>
                      <td colspan="4" class="text-center py-5 text-muted-custom">
                        <i class="bi bi-person-badge d-block mb-2" style="font-size: 2.5rem; opacity: 0.3;"></i>
                        No se encontraron docentes que coincidan con la búsqueda.
                      </td>
                    </tr>
                  } @else {
                    @for (doc of filteredDocentes(); track doc.id) {
                      <tr>
                        <!-- Name & Avatar -->
                        <td class="ps-4 py-3 text-start">
                          <div class="d-flex align-items-center gap-3">
                            <div class="user-avatar-mini admin-avatar">
                              {{ doc.nombres.charAt(0) }}{{ doc.apellidos.charAt(0) }}
                            </div>
                            <div class="fw-bold text-dark-title">{{ doc.nombres }} {{ doc.apellidos }}</div>
                          </div>
                        </td>
                        <!-- Email -->
                        <td class="text-muted-custom text-start">{{ doc.email || 'Sin correo registrado' }}</td>
                        <!-- Status -->
                        <td class="text-start">
                          @let status = (doc.estado | statusBadge);
                          <span class="badge-status" [ngClass]="'badge-status-' + doc.estado.toLowerCase()">
                            <span class="status-indicator"></span>
                            {{ status.label }}
                          </span>
                        </td>
                        <!-- Actions -->
                        <td class="text-end pe-4">
                          <div class="action-buttons-group d-inline-flex gap-2">
                            <!-- Edit Button -->
                            <button class="action-circle-btn edit-btn" (click)="openEditForm(doc)" title="Editar">
                              <i class="bi bi-pencil-fill"></i>
                            </button>
                            <!-- Inactivate Button -->
                            @if (doc.estado === 'ACTIVO') {
                              <button class="action-circle-btn deactivate-btn" (click)="inactivarDocente(doc)" title="Inactivar Docente">
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
                <i class="bi" [class.bi-person-badge-fill]="!isEditMode()" [class.bi-pencil-fill]="isEditMode()"></i>
                {{ isEditMode() ? 'Editar Datos de Docente' : 'Registrar Nuevo Docente' }}
              </h2>
              <button class="btn-close-modal" (click)="closeForm()"><i class="bi bi-x-lg"></i></button>
            </div>

            <!-- Modal Content Form -->
            <div class="premium-modal-body">
              <form [formGroup]="docenteForm" (ngSubmit)="onSubmit()">
                <!-- Names & Lastnames in a two-column row -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6 text-start">
                    <div class="glass-form-group">
                      <label class="glass-form-label">Nombres</label>
                      <input 
                        type="text" 
                        class="glass-input" 
                        placeholder="Nombres"
                        formControlName="nombres"
                        [class.is-invalid]="submitted() && f['nombres'].errors"
                      />
                      @if (submitted() && f['nombres'].errors) {
                        <div class="error-feedback text-danger small mt-1">Requerido (letras únicamente).</div>
                      }
                    </div>
                  </div>
                  <div class="col-md-6 text-start">
                    <div class="glass-form-group">
                      <label class="glass-form-label">Apellidos</label>
                      <input 
                        type="text" 
                        class="glass-input" 
                        placeholder="Apellidos"
                        formControlName="apellidos"
                        [class.is-invalid]="submitted() && f['apellidos'].errors"
                      />
                      @if (submitted() && f['apellidos'].errors) {
                        <div class="error-feedback text-danger small mt-1">Requerido (letras únicamente).</div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Email input -->
                <div class="glass-form-group mb-4 text-start">
                  <label class="glass-form-label">Correo Electrónico (Opcional)</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-envelope-fill input-icon"></i>
                    <input 
                      type="email" 
                      class="glass-input ps-5" 
                      placeholder="docente@utp.edu.pe"
                      formControlName="email"
                      [class.is-invalid]="submitted() && f['email'].errors"
                    />
                  </div>
                  @if (submitted() && f['email'].errors) {
                    <div class="error-feedback text-danger small mt-1">Formato de correo electrónico inválido.</div>
                  }
                </div>

                <!-- Action Button Footer inside form -->
                <div class="premium-modal-footer d-flex gap-3 justify-content-end mt-4 pt-3 border-top border-light-subtle">
                  <button type="button" class="btn-cancel-modal py-2 px-4" (click)="closeForm()">Cancelar</button>
                  <button type="submit" class="btn-primary-glass py-2 px-5 rounded-pill shadow-sm" [disabled]="isLoadingForm()">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" [class.d-none]="!isLoadingForm()"></span>
                    {{ isEditMode() ? 'Guardar Cambios' : 'Registrar Docente' }}
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
    .admin-docentes {
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
    
    /* Mini Avatar */
    .user-avatar-mini {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(217, 119, 6, 0.08);
      color: #d97706;
      border: 1px solid rgba(217, 119, 6, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      flex-shrink: 0;
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

  // Filters state
  readonly searchTerm = signal<string>('');
  filterEstado = '';

  // Reactively filter teachers
  readonly filteredDocentes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.docentes();
    if (!term) return list;
    return list.filter(d => 
      d.nombres.toLowerCase().includes(term) || 
      d.apellidos.toLowerCase().includes(term) || 
      (d.email && d.email.toLowerCase().includes(term))
    );
  });

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
      next: (res) => {
        let result = res;
        if (this.filterEstado) {
          result = result.filter(d => d.estado === this.filterEstado);
        }
        this.docentes.set(result);
      },
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
            this.uiService.showSuccess('Docente inactivada con éxito.');
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
