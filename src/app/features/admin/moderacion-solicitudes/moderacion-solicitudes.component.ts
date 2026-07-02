import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
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
import { FormsModule } from '@angular/forms';

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
      <div class="row mb-4 align-items-center">
        <div class="col-md-7">
          <h1 class="h2 fw-bold text-white">Moderación de Solicitudes</h1>
          <p class="text-muted-custom">Resuelve sugerencias de estudiantes para crear nuevos cursos o docentes en cascada.</p>
        </div>
        <div class="col-md-5 text-md-end">
          <div class="d-inline-flex align-items-center bg-dark-opacity px-3 py-1.5 rounded border border-white-05">
            <label class="me-2 small text-muted-custom">Filtro Estado:</label>
            <select class="bg-transparent border-0 text-white small" [(ngModel)]="filterEstado" (change)="loadQueue()">
              <option value="PENDIENTE">Pendientes únicamente</option>
              <option value="APROBADA">Aprobadas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="list" [count]="3"></app-loading-skeleton>
      } @else if (queue().length === 0) {
        <app-empty-state 
          icon="bi-check2-all"
          title="Cola de Solicitudes Vacía" 
          description="¡Buen trabajo! No hay solicitudes pendientes de moderar bajo este estado."
        ></app-empty-state>
      } @else {
        <div class="row g-4">
          @for (sol of queue(); track sol.idSolicitud) {
            <div class="col-12">
              <div class="moderation-card glass-card">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom pb-3">
                  <div>
                    <span class="badge-badge badge-warning me-2">Solicitud ID: #{{ sol.idSolicitud }}</span>
                    <span class="badge-badge" [class]="(sol.tipo | statusBadge).class">
                      {{ (sol.tipo | statusBadge).label }}
                    </span>
                    @let status = (sol.estado | statusBadge);
                    <span class="badge-badge ms-2" [class]="status.class">{{ status.label }}</span>
                    <span class="text-muted-custom small ms-md-3">
                      <i class="bi bi-clock me-1"></i>Enviada el: {{ sol.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                  <div class="student-info-tag small text-muted-custom">
                    Estudiante: <strong class="text-white">{{ sol.estudiante.nombreCompleto }}</strong> ({{ sol.estudiante.correo }})
                  </div>
                </div>

                <!-- Suggestions content details -->
                <div class="row g-3 mb-4 bg-dark-opacity p-3 rounded border border-white-05">
                  @if (sol.requestedData.nombreCursoSugerido) {
                    <div class="col-md-6">
                      <span class="d-block small text-muted-custom">Nombre Curso Sugerido:</span>
                      <strong class="text-white font-size-lg">{{ sol.requestedData.nombreCursoSugerido }}</strong>
                      @if (sol.requestedData.carreraSugeridaNombre) {
                        <span class="d-block text-gold small">Sugerido para: {{ sol.requestedData.carreraSugeridaNombre }}</span>
                      }
                    </div>
                  }
                  @if (sol.requestedData.nombreDocenteSugerido) {
                    <div class="col-md-6">
                      <span class="d-block small text-muted-custom">Nombre Docente Sugerido:</span>
                      <strong class="text-white font-size-lg">{{ sol.requestedData.nombreDocenteSugerido }}</strong>
                    </div>
                  }
                </div>

                <div class="comment-block p-3 rounded mb-3 bg-dark-opacity">
                  <span class="d-block small text-muted-custom mb-1">Comentario para la Reseña Inicial:</span>
                  <p class="comment-text text-muted-custom mb-0 font-style-italic">"{{ sol.comentario }}"</p>
                </div>

                <!-- Rejection Reason input (Visible only when clicking reject) -->
                @if (activeRejectId() === sol.idSolicitud) {
                  <div class="reject-overlay mt-4 pt-3 border-top d-flex flex-column flex-md-row gap-2 align-items-end">
                    <div class="flex-grow-1 text-start">
                      <label class="glass-form-label text-danger">Motivo del Rechazo (Obligatorio)</label>
                      <input 
                        type="text" 
                        class="glass-input" 
                        placeholder="Especifica el motivo del rechazo (ej: Ya existe en catálogo, spam...)"
                        [(ngModel)]="rejectReasonText"
                      />
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-secondary py-2" (click)="cancelReject()">Cancelar</button>
                      <button class="btn btn-danger py-2" [disabled]="!rejectReasonText.trim()" (click)="confirmReject(sol.idSolicitud)">
                        Confirmar Rechazo
                      </button>
                    </div>
                  </div>
                }

                <!-- Cascading Approval Form (Visible only when clicking approve) -->
                @if (activeApproveId() === sol.idSolicitud) {
                  <div class="approval-form-overlay mt-4 pt-3 border-top text-start">
                    <h3 class="h6 fw-bold text-success mb-3"><i class="bi bi-gear-fill me-2"></i>Configuración de Aprobación en Cascada</h3>
                    
                    <form [formGroup]="approveForm" (ngSubmit)="confirmApprove(sol)">
                      
                      <!-- Course creation configuration -->
                      @if (sol.tipo === 'CURSO_NUEVO' || sol.tipo === 'AMBOS') {
                        <div class="row g-3 mb-4 bg-dark-opacity p-3 rounded border border-white-05">
                          <h4 class="h6 text-white fw-bold col-12 mb-0">Configuración del Curso Nuevo</h4>
                          
                          <div class="col-md-6">
                            <label class="glass-form-label">Tipo de Curso a Crear</label>
                            <select class="glass-input" formControlName="tipoCurso">
                              <option value="GENERAL">Estudios Generales (GENERAL)</option>
                              <option value="CARRERA">Específico de Carrera (CARRERA)</option>
                            </select>
                          </div>
                          
                          <div class="col-md-6">
                            <label class="glass-form-label">Asociar a Carrera (Si es de CARRERA)</label>
                            <select class="glass-input" formControlName="carreraId">
                              <option value="">Ninguna / Generales</option>
                              @for (carrera of carreras(); track carrera.id) {
                                <option [value]="carrera.id">{{ carrera.nombre }}</option>
                              }
                            </select>
                          </div>

                          <div class="col-md-12 my-2 text-center text-muted">Ó asigna a uno existente para evitar duplicar:</div>

                          <div class="col-md-12">
                            <label class="glass-form-label">Vincular a Curso Existente (Opcional)</label>
                            <select class="glass-input" formControlName="cursoExistenteId">
                              <option value="">-- No vincular, crear nuevo sugerido --</option>
                              @for (c of cursos(); track c.id) {
                                <option [value]="c.id">{{ c.nombre }} ({{ c.tipo }})</option>
                              }
                            </select>
                          </div>
                        </div>
                      } @else {
                        <!-- If suggesting only teacher, allow mapping to existing course -->
                        <div class="row g-3 mb-4 bg-dark-opacity p-3 rounded border border-white-05">
                          <div class="col-12">
                            <label class="glass-form-label">Curso Existente para Vincular al Docente (Requerido)</label>
                            <select class="glass-input" formControlName="cursoExistenteId" required>
                              <option value="">-- Selecciona el curso --</option>
                              @for (c of cursos(); track c.id) {
                                <option [value]="c.id">{{ c.nombre }} ({{ c.tipo }})</option>
                              }
                            </select>
                          </div>
                        </div>
                      }

                      <!-- Teacher configuration -->
                      @if (sol.tipo === 'DOCENTE_NUEVO' || sol.tipo === 'AMBOS') {
                        <div class="row g-3 mb-4 bg-dark-opacity p-3 rounded border border-white-05">
                          <h4 class="h6 text-white fw-bold col-12 mb-0">Configuración del Docente Nuevo</h4>
                          <div class="col-12">
                            <label class="glass-form-label">Vincular a Docente Existente (Opcional)</label>
                            <select class="glass-input" formControlName="docenteExistenteId">
                              <option value="">-- No vincular, crear nuevo sugerido --</option>
                              @for (d of docentes(); track d.id) {
                                <option [value]="d.id">{{ d.nombres }} {{ d.apellidos }}</option>
                              }
                            </select>
                          </div>
                        </div>
                      } @else {
                        <!-- If suggesting only course, allow mapping to existing teacher -->
                        <div class="row g-3 mb-4 bg-dark-opacity p-3 rounded border border-white-05">
                          <div class="col-12">
                            <label class="glass-form-label">Docente Existente para Vincular al Curso (Requerido)</label>
                            <select class="glass-input" formControlName="docenteExistenteId" required>
                              <option value="">-- Selecciona el docente --</option>
                              @for (d of docentes(); track d.id) {
                                <option [value]="d.id">{{ d.nombres }} {{ d.apellidos }}</option>
                              }
                            </select>
                          </div>
                        </div>
                      }

                      <!-- Required Scores for the Published Review -->
                      <div class="mb-4 bg-dark-opacity p-3 rounded border border-white-05">
                        <h4 class="h6 text-white fw-bold mb-3">Calificaciones de la Reseña Inicial</h4>
                        <p class="small text-muted-custom">Asigna calificaciones de 1 a 5 para la reseña automática que se generará.</p>
                        
                        <div class="criteria-ratings-grid">
                          @for (crit of activeCriteria(); track crit.id; let i = $index) {
                            <div class="criteria-row d-flex justify-content-between align-items-center mb-2 p-2 rounded bg-black-opacity">
                              <span class="small text-white">{{ crit.nombre }}</span>
                              <app-star-rating 
                                [value]="getStarValue(i)"
                                (valueChange)="setStarValue(i, $event)"
                                [showValue]="true"
                              ></app-star-rating>
                            </div>
                          }
                        </div>
                        @if (submittedApprove() && ratingsFormArray.invalid) {
                          <div class="invalid-feedback text-end">Todas las calificaciones son requeridas (mínimo 1 estrella).</div>
                        }
                      </div>

                      <!-- Submit buttons -->
                      <div class="d-flex gap-2 justify-content-end mt-4">
                        <button type="button" class="btn btn-secondary" (click)="cancelApprove()">Cancelar</button>
                        <button type="submit" class="btn btn-success" [disabled]="isLoadingForm()">
                          Confirmar Aprobación Cascada
                        </button>
                      </div>

                    </form>
                  </div>
                }

                <!-- Action buttons standard -->
                @if (sol.estado === 'PENDIENTE' && activeRejectId() !== sol.idSolicitud && activeApproveId() !== sol.idSolicitud) {
                  <div class="moderation-actions mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
                    <button class="btn btn-danger py-2 px-4" (click)="startReject(sol.idSolicitud)">
                      <i class="bi bi-x-lg me-2"></i>Rechazar
                    </button>
                    <button class="btn btn-success py-2 px-4" (click)="startApprove(sol)">
                      <i class="bi bi-check-lg me-2"></i>Aprobar en Cascada
                    </button>
                  </div>
                }
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
    .bg-dark-opacity {
      background: rgba(0, 0, 0, 0.2);
    }
    .bg-black-opacity {
      background: rgba(0, 0, 0, 0.4);
    }
    .border-white-05 {
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .comment-text {
      line-height: 1.5;
    }
    .text-red {
      color: #f87171;
    }
    .font-size-lg {
      font-size: 1.1rem;
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
        this.queue.set(res);
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
    
    // Clear ratings values, make sure they are reloaded
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

    // Dynamic checks
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
