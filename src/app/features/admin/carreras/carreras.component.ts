import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CarreraResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-carreras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  template: `
    <div class="admin-carreras">
      <!-- Header Row -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 text-start">
          <h1 class="h2 fw-bold text-dark-title">Gestionar Carreras Profesionales</h1>
          <p class="text-muted-custom">Administra las carreras universitarias de la UTP en el sistema.</p>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0">
          <button class="btn-primary-glass px-4 py-2.5 rounded-pill shadow-sm" (click)="openCreateForm()">
            <i class="bi bi-plus-circle-fill me-2"></i>Nueva Carrera
          </button>
        </div>
      </div>

      <!-- Unified Filters Bar -->
      <div class="glass-card mb-4 p-3 search-filter-bar">
        <div class="row g-3 align-items-center">
          <!-- Text Search Input -->
          <div class="col-md-8">
            <div class="search-input-group">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                class="form-control filter-search-input" 
                placeholder="Buscar por nombre de carrera..."
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
              <select class="form-select filter-select" [(ngModel)]="filterEstado" (change)="loadCarreras()">
                <option value="">Todos los Estados</option>
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Carreras Table (col-12) -->
      <div class="row">
        <div class="col-12">
          <div class="glass-card p-0 overflow-hidden shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 custom-admin-table">
                <thead>
                  <tr>
                    <th class="ps-4 py-3">Código</th>
                    <th>Nombre de la Carrera</th>
                    <th>Estado</th>
                    <th class="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredCarreras().length === 0) {
                    <tr>
                      <td colspan="4" class="text-center py-5 text-muted-custom">
                        <i class="bi bi-mortarboard d-block mb-2" style="font-size: 2.5rem; opacity: 0.3;"></i>
                        No se encontraron carreras que coincidan con la búsqueda.
                      </td>
                    </tr>
                  } @else {
                    @for (carrera of filteredCarreras(); track carrera.id) {
                      <tr>
                        <!-- ID -->
                        <td class="ps-4 py-3 text-muted-custom font-monospace text-start">#{{ carrera.id }}</td>
                        <!-- Name -->
                        <td class="text-dark-title fw-bold text-start">{{ carrera.nombre }}</td>
                        <!-- Status -->
                        <td class="text-start">
                          @let status = (carrera.estado | statusBadge);
                          <span class="badge-status" [ngClass]="'badge-status-' + carrera.estado.toLowerCase().slice(0, -1)">
                            <span class="status-indicator"></span>
                            {{ status.label }}
                          </span>
                        </td>
                        <!-- Actions -->
                        <td class="text-end pe-4">
                          <div class="action-buttons-group d-inline-flex gap-2">
                            <!-- Edit Button -->
                            <button class="action-circle-btn edit-btn" (click)="openEditForm(carrera)" title="Editar">
                              <i class="bi bi-pencil-fill"></i>
                            </button>
                            <!-- Inactivate Button -->
                            @if (carrera.estado === 'ACTIVA') {
                              <button class="action-circle-btn deactivate-btn" (click)="inactivarCarrera(carrera)" title="Inactivar Carrera">
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
                <i class="bi" [class.bi-mortarboard-fill]="!isEditMode()" [class.bi-pencil-fill]="isEditMode()"></i>
                {{ isEditMode() ? 'Editar Carrera Profesional' : 'Registrar Nueva Carrera' }}
              </h2>
              <button class="btn-close-modal" (click)="closeForm()"><i class="bi bi-x-lg"></i></button>
            </div>

            <!-- Modal Content Form -->
            <div class="premium-modal-body">
              <form [formGroup]="carreraForm" (ngSubmit)="onSubmit()">
                <!-- Carrera Name input -->
                <div class="glass-form-group mb-4 text-start">
                  <label class="glass-form-label">Nombre de la Carrera</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-tag-fill input-icon"></i>
                    <input 
                      type="text" 
                      class="glass-input ps-5" 
                      placeholder="Ej: Ingeniería de Sistemas, Administración..."
                      formControlName="nombre"
                      [class.is-invalid]="submitted() && f['nombre'].errors"
                    />
                  </div>
                  @if (submitted() && f['nombre'].errors) {
                    <div class="error-feedback text-danger small mt-1">El nombre de la carrera es obligatorio.</div>
                  }
                </div>

                <!-- Action Button Footer inside form -->
                <div class="premium-modal-footer d-flex gap-3 justify-content-end mt-4 pt-3 border-top border-light-subtle">
                  <button type="button" class="btn-cancel-modal py-2 px-4" (click)="closeForm()">Cancelar</button>
                  <button type="submit" class="btn-primary-glass py-2 px-5 rounded-pill shadow-sm" [disabled]="isLoadingForm()">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" [class.d-none]="!isLoadingForm()"></span>
                    {{ isEditMode() ? 'Guardar Cambios' : 'Registrar Carrera' }}
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
    .admin-carreras {
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
    .badge-status-activ {
      background: rgba(5, 150, 105, 0.06);
      color: #059669;
      border: 1px solid rgba(5, 150, 105, 0.12);
    }
    .badge-status-activ .status-indicator { background-color: #059669; }
    
    .badge-status-inactiv {
      background: rgba(107, 114, 128, 0.06);
      color: #4b5563;
      border: 1px solid rgba(107, 114, 128, 0.12);
    }
    .badge-status-inactiv .status-indicator { background-color: #4b5563; }
    
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
      max-width: 500px;
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

  // Filters state
  readonly searchTerm = signal<string>('');
  filterEstado = '';

  // Reactively filter careers
  readonly filteredCarreras = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.carreras();
    if (!term) return list;
    return list.filter(c => c.nombre.toLowerCase().includes(term));
  });

  readonly carreraForm = this.fb.group({
    nombre: ['', [Validators.required]]
  });

  get f() { return this.carreraForm.controls; }

  ngOnInit(): void {
    this.loadCarreras();
  }

  loadCarreras(): void {
    // If filterEstado is set, we pass it, but wait!
    // The adminService.listarCarreras() doesn't accept query parameters for status in admin.service.ts:
    // listarCarreras(): Observable<CarreraResponse[]> { return this.http.get<CarreraResponse[]>(`${environment.apiUrl}/admin/carreras`); }
    // So we can filter the status on client side as well!
    this.adminService.listarCarreras().subscribe({
      next: (res) => {
        // If filterEstado is active, filter client side
        let result = res;
        if (this.filterEstado) {
          result = res.filter(c => c.estado === this.filterEstado);
        }
        this.carreras.set(result);
      },
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
