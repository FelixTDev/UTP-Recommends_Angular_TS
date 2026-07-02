import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { PublicService } from '../../../core/services/public.service';
import { UiService } from '../../../core/services/ui.service';
import { ActiveCourseTeacherOptionResponse, ResenaCreateRequest, CriterioPuntajeRequest } from '../../../core/models/student.models';
import { CriterioResponse } from '../../../core/models/admin.models';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-nueva-resena',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StarRatingComponent],
  template: `
    <div class="nueva-resena">
      <div class="row mb-4">
        <div class="col">
          <h1 class="h2 fw-bold text-white">{{ isResubmission() ? 'Reenviar Reseña Rechazada' : 'Escribir Nueva Reseña' }}</h1>
          <p class="text-muted-custom">
            {{ isResubmission() ? 'Modifica tu reseña según las observaciones del moderador.' : 'Comparte tu experiencia académica de forma justa y objetiva.' }}
          </p>
        </div>
      </div>

      <!-- Rejected Info Box -->
      @if (isResubmission() && rejectedReason()) {
        <div class="alert alert-danger border-0 bg-danger-opacity text-red mb-4 p-3 rounded">
          <h4 class="h6 fw-bold mb-1"><i class="bi bi-exclamation-triangle-fill me-2"></i>Motivo de Rechazo del Administrador:</h4>
          <p class="mb-0 small font-style-italic">"{{ rejectedReason() }}"</p>
        </div>
      }

      <div class="row">
        <div class="col-lg-8">
          <div class="glass-card">
            <form [formGroup]="reviewForm" (ngSubmit)="onSubmit()">
              
              <!-- Search Course-Teacher Assignment -->
              <div class="glass-form-group position-relative">
                <label class="glass-form-label">Asignación Curso - Docente</label>
                
                @if (isResubmission()) {
                  <input 
                    type="text" 
                    class="glass-input" 
                    [value]="selectedOptionName()" 
                    disabled 
                  />
                  <small class="text-muted-custom mt-1 d-block">No se puede cambiar el curso-docente en un reenvío.</small>
                } @else {
                  <input 
                    type="text" 
                    class="glass-input" 
                    placeholder="Escribe para buscar... (ej: Cálculo, Gómez)"
                    formControlName="searchText"
                    (input)="onSearchInput($event)"
                    (focus)="showDropdown.set(true)"
                  />
                  
                  <!-- Autocomplete Dropdown -->
                  @if (showDropdown() && searchOptions().length > 0) {
                    <div class="autocomplete-dropdown glass-card p-0">
                      @for (opt of searchOptions(); track opt.idCursoDocente) {
                        <div 
                          class="dropdown-item-custom" 
                          (click)="selectOption(opt)"
                        >
                          <div class="fw-bold text-white">{{ opt.nombreDocente }}</div>
                          <div class="small text-muted-custom">{{ opt.nombreCurso }} ({{ opt.tipoCurso }})</div>
                        </div>
                      }
                    </div>
                  }
                  
                  @if (selectedOption()) {
                    <div class="selected-option-tag mt-3 p-3 rounded d-flex justify-content-between align-items-center">
                      <div>
                        <span class="d-block small text-muted-custom">Asignación Seleccionada:</span>
                        <strong class="text-white">{{ selectedOption()?.nombreDocente }}</strong>
                        <span class="mx-2 text-muted">|</span>
                        <span>{{ selectedOption()?.nombreCurso }}</span>
                      </div>
                      <button type="button" class="btn-remove" (click)="clearSelection()">
                        <i class="bi bi-x-circle-fill"></i>
                      </button>
                    </div>
                  }

                  @if (submitted() && !selectedOption()) {
                    <div class="invalid-feedback">Debes buscar y seleccionar un curso y docente de la lista.</div>
                  }
                }
              </div>

              <div class="nav-divider my-4"></div>

              <!-- Ratings List -->
              <div class="mb-4">
                <h3 class="h6 fw-bold text-white mb-3">Calificaciones por Criterio (Obligatorios)</h3>
                
                @if (activeCriteria().length === 0) {
                  <p class="text-muted-custom small">Cargando criterios de calificación...</p>
                } @else {
                  <div class="criteria-ratings-grid">
                    @for (crit of activeCriteria(); track crit.id; let i = $index) {
                      <div class="criteria-rating-row glass-card p-3 mb-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center">
                        <div>
                          <h4 class="h6 fw-bold text-white mb-1">{{ crit.nombre }}</h4>
                          @if (crit.descripcion) {
                            <p class="small text-muted-custom mb-0">{{ crit.descripcion }}</p>
                          }
                        </div>
                        <div class="mt-3 mt-sm-0">
                          <app-star-rating 
                            [value]="getStarValue(i)"
                            (valueChange)="setStarValue(i, $event)"
                            [showValue]="true"
                          ></app-star-rating>
                          @if (submitted() && getStarControl(i).invalid) {
                            <div class="invalid-feedback text-end">Calificación es requerida.</div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Comment Input -->
              <div class="glass-form-group">
                <label class="glass-form-label">Comentario Descriptivo</label>
                <textarea 
                  class="glass-input" 
                  rows="5" 
                  placeholder="Detalla tu experiencia con este docente en este curso específico. Sé respetuoso y constructivo..."
                  formControlName="comentario"
                  [class.is-invalid]="submitted() && f['comentario'].errors"
                ></textarea>
                @if (submitted() && f['comentario'].errors) {
                  <div class="invalid-feedback">
                    @if (f['comentario'].errors['required']) { El comentario es requerido. }
                    @if (f['comentario'].errors['minlength']) { Comentario debe tener al menos 10 caracteres. }
                  </div>
                }
              </div>

              <!-- Anonimato Checkbox -->
              <div class="glass-form-group form-check mb-4">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  id="esAnonimo"
                  formControlName="esAnonimo"
                />
                <label class="form-check-label text-white ms-2" for="esAnonimo">
                  Publicar como anónimo
                </label>
                <small class="text-muted-custom d-block mt-1">
                  Tu nombre no se mostrará a otros estudiantes. Sin embargo, el administrador siempre verá tu identidad para verificar la validez de la reseña y realizar moderación.
                </small>
              </div>

              <!-- Submit Buttons -->
              <div class="text-end">
                <a routerLink="/estudiante/resenas/mis-resenas" class="btn-secondary-glass me-2 text-decoration-none">Cancelar</a>
                <button 
                  type="submit" 
                  class="btn-primary-glass"
                  [disabled]="isLoading()"
                >
                  @if (isLoading()) {
                    Enviando...
                  } @else {
                    {{ isResubmission() ? 'Reenviar Reseña' : 'Publicar Reseña' }}
                  }
                </button>
              </div>

            </form>
          </div>
        </div>

        <div class="col-lg-4 mt-4 mt-lg-0">
          <div class="glass-card">
            <h3 class="h5 fw-bold text-white mb-3"><i class="bi bi-info-circle text-gold me-2"></i>Reglas de Publicación</h3>
            <ul class="text-muted-custom small ps-3 mb-0">
              <li class="mb-2">Solo puedes publicar <strong>una reseña activa</strong> (pendiente o aprobada) por docente y curso.</li>
              <li class="mb-2">Si tu reseña es rechazada por incumplir normas, podrás corregirla y reenviarla; la versión previa se mantendrá como historial.</li>
              <li class="mb-2">Evita lenguaje soez, difamatorio o ataques personales. Las reseñas deben centrarse en la metodología y desempeño docente.</li>
              <li class="mb-2">El administrador revisará todas las reseñas pendientes antes de que sean visibles en el buscador público.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nueva-resena {
      color: var(--text-primary);
    }
    .autocomplete-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 1000;
      max-height: 250px;
      overflow-y: auto;
      background: rgba(11, 19, 41, 0.95);
      border: 1px solid var(--glass-border);
      border-radius: 8px;
    }
    .dropdown-item-custom {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: background-color 0.2s ease;
    }
    .dropdown-item-custom:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .selected-option-tag {
      background: rgba(79, 70, 229, 0.1);
      border: 1px solid rgba(79, 70, 229, 0.2);
    }
    .btn-remove {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.3rem;
      cursor: pointer;
      padding: 0;
    }
    .btn-remove:hover {
      color: #ef4444;
    }
    .bg-danger-opacity {
      background: rgba(239, 68, 68, 0.1);
    }
    .text-red {
      color: #f87171;
    }
    .criteria-rating-row {
      background: rgba(255, 255, 255, 0.02) !important;
    }
  `]
})
export class NuevaResenaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);

  readonly reviewForm = this.fb.group({
    searchText: [''],
    comentario: ['', [Validators.required, Validators.minLength(10)]],
    esAnonimo: [false],
    ratings: this.fb.array([])
  });

  // Signals for state
  readonly activeCriteria = signal<CriterioResponse[]>([]);
  readonly searchOptions = signal<ActiveCourseTeacherOptionResponse[]>([]);
  readonly selectedOption = signal<ActiveCourseTeacherOptionResponse | null>(null);
  readonly selectedOptionName = signal<string>('');
  
  readonly isResubmission = signal<boolean>(false);
  readonly rejectedId = signal<number | null>(null);
  readonly rejectedReason = signal<string | null>(null);

  readonly showDropdown = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  get f() { return this.reviewForm.controls; }
  get ratingsFormArray() { return this.reviewForm.controls.ratings as FormArray; }

  ngOnInit(): void {
    // 1. Fetch criteria first, then check route parameters
    this.loadCriteria(() => {
      this.checkQueryParams();
    });
  }

  loadCriteria(callback?: () => void): void {
    this.publicService.listarCriteriosActivos().subscribe({
      next: (res) => {
        this.activeCriteria.set(res);
        // Clear previous if any
        this.ratingsFormArray.clear();
        
        // Add a form control for each criterion
        res.forEach(() => {
          this.ratingsFormArray.push(new FormControl('', [Validators.required, Validators.min(1), Validators.max(5)]));
        });

        if (callback) callback();
      },
      error: () => this.uiService.showError('No se pudieron cargar los criterios de calificación.')
    });
  }

  checkQueryParams(): void {
    const editId = this.route.snapshot.queryParamMap.get('rejectedId');
    if (editId) {
      const id = Number(editId);
      this.isResubmission.set(true);
      this.rejectedId.set(id);
      this.loadRejectedReview(id);
    }
  }

  loadRejectedReview(id: number): void {
    this.studentService.obtenerMiResena(id).subscribe({
      next: (res) => {
        // Pre-fill comment and anonymous checkbox
        this.reviewForm.patchValue({
          comentario: res.comentario,
          esAnonimo: res.esAnonimo
        });
        
        this.selectedOptionName.set(`${res.docente} | ${res.curso}`);
        this.rejectedReason.set(res.motivoRechazo || 'Rechazado por el moderador.');
        
        // Pre-fill ratings matching active criteria IDs
        res.calificaciones.forEach((cal) => {
          const critIndex = this.activeCriteria().findIndex(c => c.id === cal.criterioId);
          if (critIndex !== -1) {
            this.ratingsFormArray.at(critIndex).setValue(cal.puntaje);
          }
        });
      },
      error: () => this.uiService.showError('No se pudo cargar la reseña rechazada previa.')
    });
  }

  onSearchInput(event: any): void {
    const val = event.target.value;
    if (!val || val.trim().length < 2) {
      this.searchOptions.set([]);
      this.showDropdown.set(false);
      return;
    }

    this.studentService.buscarCursoDocenteActivos(val).subscribe({
      next: (res) => {
        this.searchOptions.set(res);
        this.showDropdown.set(true);
      }
    });
  }

  selectOption(opt: ActiveCourseTeacherOptionResponse): void {
    this.selectedOption.set(opt);
    this.reviewForm.patchValue({ searchText: '' });
    this.searchOptions.set([]);
    this.showDropdown.set(false);
  }

  clearSelection(): void {
    this.selectedOption.set(null);
  }

  getStarControl(index: number): FormControl {
    return this.ratingsFormArray.at(index) as FormControl;
  }

  getStarValue(index: number): number {
    return Number(this.ratingsFormArray.at(index).value || 0);
  }

  setStarValue(index: number, val: number): void {
    this.ratingsFormArray.at(index).setValue(val);
    this.ratingsFormArray.at(index).markAsDirty();
  }

  onSubmit(): void {
    this.submitted.set(true);
    
    // Check if we selected the option (when not resubmitting)
    if (!this.isResubmission() && !this.selectedOption()) return;
    if (this.reviewForm.invalid) return;

    this.isLoading.set(true);

    // Build calificaciones array payload
    const calificacionesPayload: CriterioPuntajeRequest[] = this.activeCriteria().map((crit, idx) => {
      return {
        criterioId: crit.id,
        puntaje: Number(this.ratingsFormArray.at(idx).value)
      };
    });

    // In a resubmission, the backend extracts the cursoDocenteId from the database entry of the rejected review or we must supply the original one.
    // Wait! Let's check 02-logica-negocio-backend.md:
    // "Si la última reseña de esa combinación está RECHAZADA (no hay ninguna activa) → es un reenvío: se crea una fila nueva con version = anterior.version + 1 y resena_anterior_id = anterior.id, estado PENDIENTE."
    // And in the DB schema, `resena.estudiante_id` + `resena.curso_docente_id` uniquely maps. The controller is `POST /api/estudiante/resenas` consuming `ResenaCreateRequest` which has `cursoDocenteId`.
    // So even in resubmissions, we MUST send the `cursoDocenteId` in the body!
    // Since we loaded the rejected review, where do we get the original `cursoDocenteId`?
    // It's in `resena.cursoDocenteId` of the loaded rejected review!
    
    let targetCdId = 0;
    if (this.isResubmission()) {
      // In resubmission we get it from query / loaded data
      // Let's make sure we have a reference to the loaded ID
      // We can fetch it from our active rejected review reference or store it.
      // Wait, let's look at ResenaResponse: it contains `cursoDocenteId`.
      // Let's store it!
    } else {
      targetCdId = this.selectedOption()?.idCursoDocente || 0;
    }

    // Let's fetch it from our stored state
    this.studentService.obtenerMiResena(this.rejectedId() || 0).subscribe({
      next: (rejectedRes) => {
        const payload: ResenaCreateRequest = {
          cursoDocenteId: this.isResubmission() ? rejectedRes.cursoDocenteId : targetCdId,
          comentario: this.reviewForm.value.comentario || '',
          esAnonimo: !!this.reviewForm.value.esAnonimo,
          calificaciones: calificacionesPayload
        };

        this.studentService.crearResena(payload).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.uiService.showSuccess(this.isResubmission() ? 'Reseña reenviada con éxito para moderación.' : 'Reseña enviada con éxito para moderación.');
            this.router.navigate(['/estudiante/resenas/mis-resenas']);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: (err) => {
        // If not resubmission, just proceed with targetCdId
        if (!this.isResubmission()) {
          const payload: ResenaCreateRequest = {
            cursoDocenteId: targetCdId,
            comentario: this.reviewForm.value.comentario || '',
            esAnonimo: !!this.reviewForm.value.esAnonimo,
            calificaciones: calificacionesPayload
          };

          this.studentService.crearResena(payload).subscribe({
            next: () => {
              this.isLoading.set(false);
              this.uiService.showSuccess('Reseña enviada con éxito para moderación.');
              this.router.navigate(['/estudiante/resenas/mis-resenas']);
            },
            error: () => this.isLoading.set(false)
          });
        } else {
          this.isLoading.set(false);
          this.uiService.showError('No se pudo verificar el curso-docente original.');
        }
      }
    });
  }
}
