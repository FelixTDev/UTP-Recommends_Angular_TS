import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
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
      color: var(--utp-text);
    }
    .autocomplete-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 1000;
      max-height: 250px;
      overflow-y: auto;
      background: var(--utp-surface);
      border: 1px solid var(--utp-border);
      border-radius: 8px;
      box-shadow: var(--card-shadow);
    }
    .dropdown-item-custom {
      padding: 12px 16px;
      cursor: pointer;
      border-bottom: 1px solid var(--utp-border-soft);
      transition: background-color 0.2s ease;
    }
    .dropdown-item-custom:hover {
      background: var(--utp-surface-soft);
    }
    .selected-option-tag {
      background: rgba(255, 23, 68, 0.05);
      border: 1px solid rgba(255, 23, 68, 0.15);
    }
    .btn-remove {
      background: none;
      border: none;
      color: var(--utp-text-secondary);
      font-size: 1.3rem;
      cursor: pointer;
      padding: 0;
    }
    .btn-remove:hover {
      color: var(--utp-primary);
    }
    .bg-danger-opacity {
      background: rgba(220, 38, 38, 0.1);
    }
    .text-red {
      color: var(--utp-danger);
    }
    .criteria-rating-row {
      background: var(--utp-surface-soft) !important;
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

  readonly activeCriteria = signal<CriterioResponse[]>([]);
  readonly searchOptions = signal<ActiveCourseTeacherOptionResponse[]>([]);
  readonly selectedOption = signal<ActiveCourseTeacherOptionResponse | null>(null);
  readonly selectedOptionName = signal<string>('');

  readonly isResubmission = signal<boolean>(false);
  readonly rejectedId = signal<number | null>(null);
  readonly rejectedCursoDocenteId = signal<number | null>(null);
  readonly rejectedReason = signal<string | null>(null);

  readonly showDropdown = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  get f() { return this.reviewForm.controls; }
  get ratingsFormArray() { return this.reviewForm.controls.ratings as FormArray; }

  ngOnInit(): void {
    this.loadCriteria(() => {
      this.checkQueryParams();
    });
  }

  loadCriteria(callback?: () => void): void {
    this.publicService.listarCriteriosActivos().subscribe({
      next: (res) => {
        this.activeCriteria.set(res);
        this.ratingsFormArray.clear();

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
        this.reviewForm.patchValue({
          comentario: res.comentario,
          esAnonimo: res.esAnonimo
        });

        this.selectedOptionName.set(`${res.docente} | ${res.curso}`);
        this.rejectedCursoDocenteId.set(res.cursoDocenteId);
        this.rejectedReason.set(res.motivoRechazo || 'Rechazado por el moderador.');

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

    if (!this.isResubmission() && !this.selectedOption()) return;
    if (this.reviewForm.invalid) return;

    this.isLoading.set(true);

    const calificacionesPayload: CriterioPuntajeRequest[] = this.activeCriteria().map((crit, idx) => ({
      criterioId: crit.id,
      puntaje: Number(this.ratingsFormArray.at(idx).value)
    }));

    const targetCdId = this.isResubmission()
      ? this.rejectedCursoDocenteId()
      : (this.selectedOption()?.idCursoDocente || null);

    if (!targetCdId) {
      this.isLoading.set(false);
      this.uiService.showError(
        this.isResubmission()
          ? 'No se pudo verificar el curso-docente original.'
          : 'Debes seleccionar una asignación curso-docente válida.'
      );
      return;
    }

    const payload: ResenaCreateRequest = {
      cursoDocenteId: targetCdId,
      comentario: this.reviewForm.value.comentario || '',
      esAnonimo: !!this.reviewForm.value.esAnonimo,
      calificaciones: calificacionesPayload
    };

    this.studentService.crearResena(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.uiService.showSuccess(
          this.isResubmission()
            ? 'Reseña reenviada con éxito para moderación.'
            : 'Reseña enviada con éxito para moderación.'
        );
        this.router.navigate(['/estudiante/resenas/mis-resenas']);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
