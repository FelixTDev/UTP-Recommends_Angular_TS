import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
      <!-- Header Row with title and actions -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 text-start">
          <h1 class="h2 fw-bold text-dark-title">Gestionar Usuarios</h1>
          <p class="text-muted-custom">Administra cuentas, roles y estados de los usuarios del sistema.</p>
        </div>
        <div class="col-md-6 text-md-end mt-3 mt-md-0">
          <button class="btn-primary-glass px-4 py-2.5 rounded-pill shadow-sm" (click)="openCreateForm()">
            <i class="bi bi-plus-circle-fill me-2"></i>Nuevo Usuario
          </button>
        </div>
      </div>

      <!-- Unified Filters Bar -->
      <div class="glass-card mb-4 p-3 search-filter-bar">
        <div class="row g-3 align-items-center">
          <!-- Text Search input -->
          <div class="col-lg-6 col-md-5">
            <div class="search-input-group">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                class="form-control filter-search-input" 
                placeholder="Buscar por nombre, apellido o correo electrónico..."
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
          
          <!-- Role Filter -->
          <div class="col-lg-3 col-md-3.5 col-sm-6">
            <div class="d-flex align-items-center select-filter-container">
              <i class="bi bi-shield-lock-fill filter-icon text-muted"></i>
              <select class="form-select filter-select" [(ngModel)]="filterRol" (change)="loadUsuarios()">
                <option value="">Todos los Roles</option>
                <option value="ADMIN">Administrador</option>
                <option value="ESTUDIANTE">Estudiante</option>
              </select>
            </div>
          </div>

          <!-- Status Filter -->
          <div class="col-lg-3 col-md-3.5 col-sm-6">
            <div class="d-flex align-items-center select-filter-container">
              <i class="bi bi-check-circle-fill filter-icon text-muted"></i>
              <select class="form-select filter-select" [(ngModel)]="filterEstado" (change)="loadUsuarios()">
                <option value="">Todos los Estados</option>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="SUSPENDIDO">Suspendido</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Users Table Grid (Occupies full-width col-12) -->
      <div class="row">
        <div class="col-12">
          <div class="glass-card p-0 overflow-hidden shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 custom-admin-table">
                <thead>
                  <tr>
                    <th class="ps-4 py-3">Nombre / Correo</th>
                    <th>Rol</th>
                    <th>Carrera / Código</th>
                    <th class="text-center">Reseñas</th>
                    <th>Estado</th>
                    <th class="text-end pe-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @if (filteredUsuarios().length === 0) {
                    <tr>
                      <td colspan="6" class="text-center py-5 text-muted-custom">
                        <i class="bi bi-people d-block mb-2" style="font-size: 2.5rem; opacity: 0.3;"></i>
                        No se encontraron usuarios que coincidan con los filtros y la búsqueda.
                      </td>
                    </tr>
                  } @else {
                    @for (usr of filteredUsuarios(); track usr.id) {
                      <tr>
                        <!-- Name & Email -->
                        <td class="ps-4 py-3 text-start">
                          <div class="d-flex align-items-center gap-3">
                            <div class="user-avatar-mini" [class.admin-avatar]="usr.rol === 'ADMIN'">
                              {{ usr.nombres.charAt(0) }}{{ usr.apellidos.charAt(0) }}
                            </div>
                            <div>
                              <div class="fw-bold text-dark-title mb-0.5">{{ usr.nombres }} {{ usr.apellidos }}</div>
                              <div class="text-muted-custom small">{{ usr.email }}</div>
                            </div>
                          </div>
                        </td>
                        <!-- Role -->
                        <td class="text-start">
                          <span class="badge-role" [class.admin-role]="usr.rol === 'ADMIN'" [class.student-role]="usr.rol === 'ESTUDIANTE'">
                            {{ usr.rol === 'ADMIN' ? 'Administrador' : 'Estudiante' }}
                          </span>
                        </td>
                        <!-- Career & Code -->
                        <td class="small text-muted-custom text-start">
                          @if (usr.rol === 'ESTUDIANTE') {
                            <div class="text-dark-title fw-medium text-truncate" style="max-width: 220px;">
                              {{ usr.carreraNombre || 'Sin carrera' }}
                            </div>
                            <div class="font-monospace text-muted" style="font-size: 0.76rem;">{{ usr.codigoEstudiante }}</div>
                          } @else {
                            <span class="text-muted">—</span>
                          }
                        </td>
                        <!-- Total Reviews -->
                        <td class="text-center font-monospace fw-bold text-dark-title">
                          @if (usr.rol === 'ESTUDIANTE') {
                            {{ usr.totalResenas }}
                          } @else {
                            <span class="text-muted">—</span>
                          }
                        </td>
                        <!-- Status -->
                        <td class="text-start">
                          @let status = (usr.estado | statusBadge);
                          <span class="badge-status" [ngClass]="'badge-status-' + usr.estado.toLowerCase()">
                            <span class="status-indicator"></span>
                            {{ status.label }}
                          </span>
                        </td>
                        <!-- Actions -->
                        <td class="text-end pe-4">
                          <div class="action-buttons-group d-inline-flex gap-2">
                            <!-- Edit Button -->
                            <button class="action-circle-btn edit-btn" (click)="openEditForm(usr)" title="Editar">
                              <i class="bi bi-pencil-fill"></i>
                            </button>
                            <!-- Suspend Button -->
                            <button 
                              class="action-circle-btn suspend-btn" 
                              (click)="changeStatus(usr, 'SUSPENDIDO')" 
                              title="Suspender Usuario"
                              [disabled]="usr.estado === 'SUSPENDIDO'"
                            >
                              <i class="bi bi-slash-circle-fill"></i>
                            </button>
                            <!-- Toggle Active/Inactive Button -->
                            @if (usr.estado === 'ACTIVO') {
                              <button class="action-circle-btn deactivate-btn" (click)="changeStatus(usr, 'INACTIVO')" title="Inactivar Usuario">
                                <i class="bi bi-toggle-off"></i>
                              </button>
                            } @else {
                              <button class="action-circle-btn activate-btn" (click)="changeStatus(usr, 'ACTIVO')" title="Activar Usuario">
                                <i class="bi bi-toggle-on"></i>
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
                <i class="bi" [class.bi-person-plus-fill]="!isEditMode()" [class.bi-person-dash-fill]="isEditMode()"></i>
                {{ isEditMode() ? 'Editar Datos de Usuario' : 'Registrar Nuevo Usuario' }}
              </h2>
              <button class="btn-close-modal" (click)="closeForm()"><i class="bi bi-x-lg"></i></button>
            </div>

            <!-- Modal Content Form -->
            <div class="premium-modal-body">
              <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
                <!-- Email input -->
                <div class="glass-form-group mb-3 text-start">
                  <label class="glass-form-label">Correo Institucional</label>
                  <div class="input-icon-wrapper">
                    <i class="bi bi-envelope-fill input-icon"></i>
                    <input 
                      type="email" 
                      class="glass-input ps-5" 
                      placeholder="ejemplo@utp.edu.pe"
                      formControlName="email"
                      [class.is-invalid]="submitted() && f['email'].errors"
                    />
                  </div>
                  @if (submitted() && f['email'].errors) {
                    <div class="error-feedback text-danger small mt-1">Formato de correo institucional obligatorio.</div>
                  }
                </div>

                <!-- Password input (Create mode only) -->
                @if (!isEditMode()) {
                  <div class="glass-form-group mb-3 text-start">
                    <label class="glass-form-label">Contraseña de Acceso</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-key-fill input-icon"></i>
                      <input 
                        type="password" 
                        class="glass-input ps-5" 
                        placeholder="Mínimo 8 caracteres (A-z, 1-9, #)"
                        formControlName="password"
                        [class.is-invalid]="submitted() && f['password'].errors"
                      />
                    </div>
                    @if (submitted() && f['password'].errors) {
                      <div class="error-feedback text-danger small mt-1">
                        Debe tener mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (!&#64;#$%&*?_-).
                      </div>
                    }
                  </div>
                }

                <!-- Names & Lastnames in a two-column row -->
                <div class="row g-3 mb-3">
                  <div class="col-md-6 text-start">
                    <div class="glass-form-group">
                      <label class="glass-form-label">Nombres</label>
                      <input 
                        type="text" 
                        class="glass-input" 
                        placeholder="Nombres completos"
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
                        placeholder="Apellidos completos"
                        formControlName="apellidos"
                        [class.is-invalid]="submitted() && f['apellidos'].errors"
                      />
                      @if (submitted() && f['apellidos'].errors) {
                        <div class="error-feedback text-danger small mt-1">Requerido (letras únicamente).</div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Rol Select (Create mode only) -->
                @if (!isEditMode()) {
                  <div class="glass-form-group mb-3 text-start">
                    <label class="glass-form-label">Rol del Usuario</label>
                    <div class="input-icon-wrapper">
                      <i class="bi bi-shield-fill input-icon"></i>
                      <select 
                        class="glass-input select-arrow ps-5" 
                        formControlName="rol"
                        [class.is-invalid]="submitted() && f['rol'].errors"
                      >
                        <option value="ESTUDIANTE">ESTUDIANTE (Acceso Estudiantil)</option>
                        <option value="ADMIN">ADMINISTRADOR (Consola de Operaciones)</option>
                      </select>
                    </div>
                  </div>
                }

                <!-- Carrera Select (Conditional for ESTUDIANTE) -->
                @if (showCarreraSelect()) {
                  <div class="glass-form-group mb-4 text-start">
                    <label class="glass-form-label">Carrera (Obligatorio para Estudiantes)</label>
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
                      <div class="error-feedback text-danger small mt-1">Carrera es requerida.</div>
                    }
                  </div>
                }

                <!-- Action Button Footer inside form -->
                <div class="premium-modal-footer d-flex gap-3 justify-content-end mt-4 pt-3 border-top border-light-subtle">
                  <button type="button" class="btn-cancel-modal py-2 px-4" (click)="closeForm()">Cancelar</button>
                  <button type="submit" class="btn-primary-glass py-2 px-5 rounded-pill shadow-sm" [disabled]="isLoadingForm()">
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" [class.d-none]="!isLoadingForm()"></span>
                    {{ isEditMode() ? 'Guardar Cambios' : 'Registrar Cuenta' }}
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
    .admin-usuarios {
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
      background: rgba(2, 132, 199, 0.08);
      color: #0284c7;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      border: 1px solid rgba(2, 132, 199, 0.15);
      flex-shrink: 0;
    }
    .user-avatar-mini.admin-avatar {
      background: rgba(217, 119, 6, 0.08);
      color: #d97706;
      border-color: rgba(217, 119, 6, 0.15);
    }
    
    /* Badges role */
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
    
    .badge-status-suspendido {
      background: rgba(220, 38, 38, 0.06);
      color: #dc2626;
      border: 1px solid rgba(220, 38, 38, 0.12);
    }
    .badge-status-suspendido .status-indicator { background-color: #dc2626; }
    
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
    .suspend-btn:hover:not(:disabled) {
      border-color: rgba(217, 119, 6, 0.3);
      background: rgba(217, 119, 6, 0.05);
      color: #d97706;
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
      max-width: 580px;
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
    
    /* Form input upgrades inside modal */
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

  // Filters and search state
  readonly searchTerm = signal<string>('');
  filterRol = '';
  filterEstado = '';

  // Reactively filter users list by search term
  readonly filteredUsuarios = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.usuarios();
    if (!term) return list;
    return list.filter(u => 
      u.nombres.toLowerCase().includes(term) || 
      u.apellidos.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term) ||
      (u.codigoEstudiante && u.codigoEstudiante.toLowerCase().includes(term))
    );
  });

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
