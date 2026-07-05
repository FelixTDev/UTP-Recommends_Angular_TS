import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PublicService } from '../../../core/services/public.service';
import { 
  ModeracionSolicitudResponse, 
  CursoResponse, 
  DocenteResponse, 
  CarreraResponse, 
  CriterioResponse 
} from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-moderacion-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgePipe,
    StarRatingComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="moderacion-solicitudes">
      <!-- Header Row -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 text-start">
          <h1 class="h2 fw-bold text-dark-title">Moderación de Solicitudes</h1>
          <p class="text-muted-custom">Resuelve sugerencias de estudiantes para crear nuevos cursos o docentes en el catálogo.</p>
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
                placeholder="Buscar por curso, docente sugerido, comentario o estudiante..."
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
              <i class="bi bi-funnel-fill filter-icon text-muted"></i>
              <select class="form-select filter-select" [(ngModel)]="filterEstado" (change)="loadQueue()">
                <option value="PENDIENTE">Pendientes únicamente</option>
                <option value="APROBADA">Aprobadas</option>
                <option value="RECHAZADA">Rechazadas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="list" [count]="2"></app-loading-skeleton>
      } @else if (filteredQueue().length === 0) {
        <app-empty-state 
          icon="bi-check2-all"
          title="Cola de Solicitudes Vacía" 
          description="No se encontraron solicitudes registradas bajo esta búsqueda o filtro."
        ></app-empty-state>
      } @else {
        <div class="row g-4">
          @for (sol of filteredQueue(); track sol.idSolicitud) {
            <div class="col-12">
              <div class="moderation-card glass-card text-start">
                
                <!-- Request Card Header -->
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom pb-3">
                  <div class="d-flex flex-wrap align-items-center gap-2">
                    <span class="badge-role student-role">Solicitud ID: #{{ sol.idSolicitud }}</span>
                    <!-- Request Type badge -->
                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 rounded" style="font-size: 0.78rem; font-weight: 700;">
                      <i class="bi" [class.bi-book]="sol.tipo === 'CURSO_NUEVO'" [class.bi-person-workspace]="sol.tipo === 'DOCENTE_NUEVO'" [class.bi-mortarboard]="sol.tipo === 'AMBOS'"></i>
                      {{ sol.tipo === 'CURSO_NUEVO' ? 'Curso Nuevo' : sol.tipo === 'DOCENTE_NUEVO' ? 'Docente Nuevo' : 'Curso y Docente' }}
                    </span>
                    <!-- Publish Status badge -->
                    @let status = (sol.estado | statusBadge);
                    <span class="badge-status" [ngClass]="'badge-status-' + sol.estado.toLowerCase()">
                      <span class="status-indicator"></span>
                      {{ status.label }}
                    </span>
                    <span class="text-muted-custom small ms-md-2">
                      <i class="bi bi-calendar3 me-2"></i>{{ sol.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                  
                  <!-- Student Metadata -->
                  <div class="student-info-tag small text-muted-custom bg-light-subtle px-3 py-2 rounded-pill border border-light-subtle">
                    <i class="bi bi-person-fill me-2 text-primary-color"></i>
                    Estudiante: <strong class="text-dark-title">{{ sol.estudiante.nombreCompleto }}</strong> 
                    <span class="text-muted-custom font-monospace"> ({{ sol.estudiante.correo }})</span>
                  </div>
                </div>

                <!-- Suggestions content details -->
                <div class="row g-3 mb-3 bg-light p-3 rounded border border-light-subtle">
                  @if (sol.requestedData.nombreCursoSugerido) {
                    <div class="col-md-6 text-start">
                      <span class="d-block small text-muted-custom mb-1"><i class="bi bi-book-fill me-2 text-primary"></i>Curso Sugerido por Alumno:</span>
                      <strong class="text-dark-title fs-5">{{ sol.requestedData.nombreCursoSugerido }}</strong>
                      @if (sol.requestedData.carreraSugeridaNombre) {
                        <span class="d-block text-gold small fw-bold mt-1"><i class="bi bi-mortarboard-fill me-2"></i>Sugerido para: {{ sol.requestedData.carreraSugeridaNombre }}</span>
                      }
                    </div>
                  }
                  @if (sol.requestedData.nombreDocenteSugerido) {
                    <div class="col-md-6 text-start border-start-desktop">
                      <span class="d-block small text-muted-custom mb-1"><i class="bi bi-person-badge-fill me-2 text-warning"></i>Docente Sugerido por Alumno:</span>
                      <strong class="text-dark-title fs-5">{{ sol.requestedData.nombreDocenteSugerido }}</strong>
                    </div>
                  }
                </div>

                <!-- Comment block -->
                <div class="comment-block p-3 rounded mb-3 bg-light border-start-warning">
                  <span class="d-block small text-muted-custom mb-2 fw-bold">Comentario de Reseña a Publicar:</span>
                  <p class="comment-text text-dark-title mb-0 fs-6">"{{ sol.comentario }}"</p>
                </div>

                <!-- Action Controls overlay -->
                <div class="moderation-actions mt-4 pt-3 border-top text-start">
                  
                  <!-- Reject Reason input overlay -->
                  @if (activeRejectId() === sol.idSolicitud) {
                    <div class="w-100 d-flex flex-column gap-2 bg-danger-subtle p-3 rounded border border-danger-subtle animate-fade mb-2">
                      <div class="text-start">
                        <label class="glass-form-label text-danger mb-2 fw-bold"><i class="bi bi-exclamation-circle-fill me-2"></i>Especificar Motivo del Rechazo (Obligatorio)</label>
                        <input 
                          type="text" 
                          class="form-control glass-input" 
                          placeholder="Indique por qué rechaza esta solicitud..."
                          [(ngModel)]="rejectReasonText"
                        />
                      </div>
                      <div class="d-flex gap-2 justify-content-end mt-1">
                        <button class="btn btn-sm btn-cancel-modal py-2 px-3" (click)="cancelReject()">Cancelar</button>
                        <button class="btn btn-sm btn-danger py-2 px-4 rounded-pill shadow-sm" [disabled]="!rejectReasonText.trim()" (click)="confirmReject(sol.idSolicitud)">
                          Confirmar Rechazo
                        </button>
                      </div>
                    </div>
                  }

                  <!-- Cascading Approval Form -->
                  @if (activeApproveId() === sol.idSolicitud) {
                    <div class="approval-form-overlay bg-light p-4 rounded border border-light-subtle animate-fade mb-3">
                      <h3 class="h6 fw-bold text-success mb-3 d-flex align-items-center gap-2">
                        <i class="bi bi-gear-fill spin-slow me-2"></i>Configuración de Aprobación en Cascada
                      </h3>
                      
                      <form [formGroup]="approveForm" (ngSubmit)="confirmApprove(sol)">
                        
                        <!-- Course configuration -->
                        @if (sol.tipo === 'CURSO_NUEVO' || sol.tipo === 'AMBOS') {
                          <div class="row g-3 mb-4 bg-white p-3 rounded border border-light-subtle">
                            <h4 class="h6 text-dark-title fw-bold col-12 mb-2"><i class="bi bi-book-fill text-primary me-1"></i>Configuración de Curso a Crear</h4>
                            
                            <div class="col-md-6">
                              <label class="glass-form-label">Tipo de Curso</label>
                              <select class="form-select glass-input select-arrow" formControlName="tipoCurso">
                                <option value="GENERAL">Estudios Generales (GENERAL)</option>
                                <option value="CARRERA">Específico de Carrera (CARRERA)</option>
                              </select>
                            </div>
                            
                            <div class="col-md-6">
                              <label class="glass-form-label">Asociar a Carrera Universitaria</label>
                              <select class="form-select glass-input select-arrow" formControlName="carreraId">
                                <option value="">Estudios Generales (Ninguna)</option>
                                @for (carrera of carreras(); track carrera.id) {
                                  <option [value]="carrera.id">{{ carrera.nombre }}</option>
                                }
                              </select>
                            </div>

                            <div class="col-12 py-1">
                              <div class="hr-text text-muted small my-2">Ó VINCULA A UN CURSO EXISTENTE PARA EVITAR DUPLICADOS</div>
                            </div>

                            <div class="col-12">
                              <label class="glass-form-label">Curso del Catálogo a Vincular</label>
                              <select class="form-select glass-input select-arrow" formControlName="cursoExistenteId">
                                <option value="">-- No vincular, crear el curso sugerido --</option>
                                @for (c of cursos(); track c.id) {
                                  <option [value]="c.id">{{ c.nombre }} ({{ c.tipo === 'GENERAL' ? 'Estudios Generales' : 'Especifico Carrera' }})</option>
                                }
                              </select>
                            </div>
                          </div>
                        } @else {
                          <!-- Teacher only suggested, requires linking to an existing course -->
                          <div class="row g-3 mb-4 bg-white p-3 rounded border border-light-subtle">
                            <div class="col-12">
                              <label class="glass-form-label text-danger fw-bold">Curso del Catálogo a Vincular (Requerido)</label>
                              <select class="form-select glass-input select-arrow" formControlName="cursoExistenteId" required>
                                <option value="">-- Selecciona el curso académico --</option>
                                @for (c of cursos(); track c.id) {
                                  <option [value]="c.id">{{ c.nombre }} ({{ c.tipo === 'GENERAL' ? 'Estudios Generales' : 'Especifico Carrera' }})</option>
                                }
                              </select>
                            </div>
                          </div>
                        }

                        <!-- Teacher configuration -->
                        @if (sol.tipo === 'DOCENTE_NUEVO' || sol.tipo === 'AMBOS') {
                          <div class="row g-3 mb-4 bg-white p-3 rounded border border-light-subtle">
                            <h4 class="h6 text-dark-title fw-bold col-12 mb-2"><i class="bi bi-person-badge-fill text-warning me-1"></i>Configuración de Docente a Crear</h4>
                            <div class="col-12">
                              <label class="glass-form-label">Vincular a Docente Existente (Opcional)</label>
                              <select class="form-select glass-input select-arrow" formControlName="docenteExistenteId">
                                <option value="">-- No vincular, crear el docente sugerido --</option>
                                @for (d of docentes(); track d.id) {
                                  <option [value]="d.id">{{ d.nombres }} {{ d.apellidos }}</option>
                                }
                              </select>
                            </div>
                          </div>
                        } @else {
                          <!-- Course only suggested, requires linking to an existing teacher -->
                          <div class="row g-3 mb-4 bg-white p-3 rounded border border-light-subtle">
                            <div class="col-12">
                              <label class="glass-form-label text-danger fw-bold">Docente del Catálogo a Vincular (Requerido)</label>
                              <select class="form-select glass-input select-arrow" formControlName="docenteExistenteId" required>
                                <option value="">-- Selecciona el docente catedrático --</option>
                                @for (d of docentes(); track d.id) {
                                  <option [value]="d.id">{{ d.nombres }} {{ d.apellidos }}</option>
                                }
                              </select>
                            </div>
                          </div>
                        }

                        <!-- Required Scores for the Published Review -->
                        <div class="mb-4 bg-white p-3 rounded border border-light-subtle">
                          <h4 class="h6 text-dark-title fw-bold mb-2"><i class="bi bi-star-fill text-gold me-1"></i>Calificaciones de la Reseña a Publicar</h4>
                          <p class="small text-muted-custom mb-3">Establece la valoración de 1 a 5 estrellas para la reseña inicial que se publicará de manera automática.</p>
                          
                          <div class="criteria-ratings-grid">
                            @for (crit of activeCriteria(); track crit.id; let i = $index) {
                              <div class="criteria-row d-flex justify-content-between align-items-center mb-2 p-2 rounded border border-light-subtle bg-light">
                                <span class="small fw-bold text-dark-title pe-2">{{ crit.nombre }}</span>
                                <app-star-rating 
                                  [value]="getStarValue(i)"
                                  (valueChange)="setStarValue(i, $event)"
                                  [showValue]="true"
                                ></app-star-rating>
                              </div>
                            }
                          </div>
                          @if (submittedApprove() && ratingsFormArray.invalid) {
                            <div class="text-danger small mt-2 text-end fw-bold"><i class="bi bi-x-circle-fill me-1"></i>Todas las calificaciones son requeridas.</div>
                          }
                        </div>

                        <!-- Submit buttons -->
                        <div class="d-flex gap-2 justify-content-end mt-4 pt-3 border-top">
                          <button type="button" class="btn btn-sm btn-cancel-modal py-2 px-3.5" (click)="cancelApprove()">Cancelar</button>
                          <button type="submit" class="btn btn-sm btn-success py-2 px-5 rounded-pill shadow-sm" [disabled]="isLoadingForm()">
                            <span class="spinner-border spinner-border-sm me-1.5" role="status" aria-hidden="true" [class.d-none]="!isLoadingForm()"></span>
                            Aprobar en Cascada
                          </button>
                        </div>

                      </form>
                    </div>
                  }

                  <!-- Standard Action buttons -->
                  @if (sol.estado === 'PENDIENTE' && activeRejectId() !== sol.idSolicitud && activeApproveId() !== sol.idSolicitud) {
                    <div class="d-flex gap-2 justify-content-end">
                      <button class="btn btn-outline-danger py-2 px-4 rounded-pill shadow-sm d-flex align-items-center gap-2" (click)="startReject(sol.idSolicitud)">
                        <i class="bi bi-x-circle-fill me-2"></i>Rechazar
                      </button>
                      <button class="btn btn-success py-2 px-4 rounded-pill shadow-sm d-flex align-items-center gap-2" (click)="startApprove(sol)">
                        <i class="bi bi-check-circle-fill me-2"></i>Aprobar en Cascada
                      </button>
                    </div>
                  }
                  
                  @if (sol.estado === 'RECHAZADA' && sol.motivoRechazo) {
                    <div class="w-100 text-start bg-light p-2.5 rounded border small text-muted-custom">
                      <strong>Motivo de Rechazo:</strong> "{{ sol.motivoRechazo }}"
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .moderacion-solicitudes {
      color: var(--text-primary);
    }
    .text-dark-title {
      color: #0f172a !important;
    }
    
    /* Spacing for icons inside headers, badges, and buttons to prevent overlaps */
    .moderation-card h3 i, 
    .moderation-card button i, 
    .moderation-card .badge-status i,
    .moderation-card .student-info-tag i,
    .moderation-card .badge i,
    .moderation-card h4 i {
      margin-right: 8px !important;
      display: inline-block;
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
    .badge-status-pendiente {
      background: rgba(217, 119, 6, 0.06);
      color: #d97706;
      border: 1px solid rgba(217, 119, 6, 0.12);
    }
    .badge-status-pendiente .status-indicator { background-color: #d97706; }
    
    .badge-status-aprobada {
      background: rgba(5, 150, 105, 0.06);
      color: #059669;
      border: 1px solid rgba(5, 150, 105, 0.12);
    }
    .badge-status-aprobada .status-indicator { background-color: #059669; }
    
    .badge-status-rechazada {
      background: rgba(220, 38, 38, 0.06);
      color: #dc2626;
      border: 1px solid rgba(220, 38, 38, 0.12);
    }
    .badge-status-rechazada .status-indicator { background-color: #dc2626; }
    
    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }

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
    
    .moderation-card {
      transition: all 0.25s ease;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid var(--utp-border);
      border-radius: 16px;
      padding: 24px;
    }
    .moderation-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.02);
      background: #ffffff;
    }

    .comment-block {
      border-left: 4px solid var(--utp-primary);
      line-height: 1.5;
    }
    .comment-text {
      font-style: italic;
      font-size: 0.95rem;
      color: #334155 !important;
    }
    
    .border-start-desktop {
      border-left: 1px solid #e2e8f0;
    }
    @media (max-width: 767.98px) {
      .border-start-desktop {
        border-left: none !important;
        border-top: 1px solid #e2e8f0;
        padding-top: 15px;
      }
    }
    
    /* Horizontal rule with text */
    .hr-text {
      display: flex;
      align-items: center;
      text-align: center;
    }
    .hr-text::before, .hr-text::after {
      content: '';
      flex: 1;
      border-bottom: 1px dashed #cbd5e1;
    }
    .hr-text::before {
      margin-right: .5em;
    }
    .hr-text::after {
      margin-left: .5em;
    }

    .glass-form-label {
      font-size: 0.8rem;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 6px;
      display: block;
    }
    .glass-input {
      width: 100%;
      padding: 10px 16px;
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
      background-position: right 14px center;
      background-size: 12px 10px;
    }
    
    .btn-cancel-modal {
      background: none;
      border: 1px solid var(--utp-border);
      border-radius: 30px;
      color: #475569;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .btn-cancel-modal:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #cbd5e1;
    }
    
    .animate-fade {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .spin-slow {
      animation: spin 8s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class ModeracionSolicitudesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly queue = signal<ModeracionSolicitudResponse[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Rejection state
  readonly activeRejectId = signal<number | null>(null);
  rejectReasonText = '';

  // Approval state
  readonly activeApproveId = signal<number | null>(null);
  readonly activeCriteria = signal<CriterioResponse[]>([]);
  readonly cursos = signal<CursoResponse[]>([]);
  readonly docentes = signal<DocenteResponse[]>([]);
  readonly carreras = signal<CarreraResponse[]>([]);

  readonly submittedApprove = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  filterEstado = 'PENDIENTE';
  readonly searchTerm = signal<string>('');

  // Computed signal for dynamic client-side live filtering
  readonly filteredQueue = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.queue();
    if (!term) return list;
    return list.filter(sol => 
      (sol.requestedData.nombreCursoSugerido && sol.requestedData.nombreCursoSugerido.toLowerCase().includes(term)) ||
      (sol.requestedData.nombreDocenteSugerido && sol.requestedData.nombreDocenteSugerido.toLowerCase().includes(term)) ||
      sol.comentario.toLowerCase().includes(term) ||
      sol.estudiante.nombreCompleto.toLowerCase().includes(term)
    );
  });

  readonly approveForm = this.fb.group({
    tipoCurso: ['GENERAL'],
    carreraId: [''],
    cursoExistenteId: [''],
    docenteExistenteId: [''],
    ratings: this.fb.array([])
  });

  get ratingsFormArray() { return this.approveForm.controls.ratings as FormArray; }

  ngOnInit(): void {
    this.loadQueue();
    this.loadCatalogs();
  }

  loadQueue(): void {
    this.isLoading.set(true);
    this.adminService.listarSolicitudesPendientes(this.filterEstado).subscribe({
      next: (res) => {
        // Fallback filter in client-side in case backend API ignores parameter
        let list = res;
        if (res && res.length > 0) {
          list = res.filter(r => r.estado === this.filterEstado);
        }
        this.queue.set(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadCatalogs(): void {
    this.publicService.listarCriteriosActivos().subscribe(res => {
      this.activeCriteria.set(res);
      this.ratingsFormArray.clear();
      res.forEach(() => {
        this.ratingsFormArray.push(new FormControl('', [Validators.required, Validators.min(1), Validators.max(5)]));
      });
    });

    this.adminService.listarCursos().subscribe(res => this.cursos.set(res.filter(c => c.estado === 'ACTIVO')));
    this.adminService.listarDocentes().subscribe(res => this.docentes.set(res.filter(d => d.estado === 'ACTIVO')));
    this.publicService.listarCarrerasActivas().subscribe(res => this.carreras.set(res));
  }

  startReject(id: number): void {
    this.activeRejectId.set(id);
    this.rejectReasonText = '';
  }

  cancelReject(): void {
    this.activeRejectId.set(null);
    this.rejectReasonText = '';
  }

  confirmReject(id: number): void {
    if (!this.rejectReasonText.trim()) return;

    this.adminService.rechazarSolicitud(id, { motivoRechazo: this.rejectReasonText.trim() }).subscribe({
      next: () => {
        this.uiService.showSuccess('Solicitud rechazada con éxito.');
        this.cancelReject();
        this.loadQueue();
      }
    });
  }

  startApprove(sol: ModeracionSolicitudResponse): void {
    this.activeApproveId.set(sol.idSolicitud);
    this.submittedApprove.set(false);
    this.approveForm.reset({
      tipoCurso: 'GENERAL',
      carreraId: '',
      cursoExistenteId: '',
      docenteExistenteId: ''
    });
    
    this.ratingsFormArray.controls.forEach(c => c.setValue(''));
  }

  cancelApprove(): void {
    this.activeApproveId.set(null);
  }

  getStarValue(index: number): number {
    return Number(this.ratingsFormArray.at(index).value || 0);
  }

  setStarValue(index: number, val: number): void {
    this.ratingsFormArray.at(index).setValue(val);
    this.ratingsFormArray.at(index).markAsDirty();
  }

  confirmApprove(sol: ModeracionSolicitudResponse): void {
    this.submittedApprove.set(true);

    const courseCtrlRequired = sol.tipo === 'DOCENTE_NUEVO';
    const teacherCtrlRequired = sol.tipo === 'CURSO_NUEVO';
    
    if (courseCtrlRequired && !this.approveForm.value.cursoExistenteId) {
      this.uiService.showError('Debes seleccionar un curso existente para asociar al docente.');
      return;
    }
    if (teacherCtrlRequired && !this.approveForm.value.docenteExistenteId) {
      this.uiService.showError('Debes seleccionar un docente existente para asociar al curso.');
      return;
    }
    
    if (this.ratingsFormArray.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = this.approveForm.value;

    const calificacionesPayload = this.activeCriteria().map((crit, idx) => {
      return {
        criterioId: crit.id,
        puntaje: Number(this.ratingsFormArray.at(idx).value)
      };
    });

    const payload = {
      tipoCurso: sol.tipo === 'CURSO_NUEVO' || sol.tipo === 'AMBOS' ? formVal.tipoCurso || 'GENERAL' : undefined,
      carreraId: (sol.tipo === 'CURSO_NUEVO' || sol.tipo === 'AMBOS') && formVal.tipoCurso === 'CARRERA' && formVal.carreraId ? Number(formVal.carreraId) : undefined,
      cursoExistenteId: formVal.cursoExistenteId ? Number(formVal.cursoExistenteId) : undefined,
      docenteExistenteId: formVal.docenteExistenteId ? Number(formVal.docenteExistenteId) : undefined,
      calificaciones: calificacionesPayload
    };

    this.adminService.aprobarSolicitud(sol.idSolicitud, payload).subscribe({
      next: () => {
        this.isLoadingForm.set(false);
        this.uiService.showSuccess('Solicitud aprobada y entidades creadas en cascada con éxito.');
        this.cancelApprove();
        this.loadQueue();
      },
      error: () => this.isLoadingForm.set(false)
    });
  }
}
