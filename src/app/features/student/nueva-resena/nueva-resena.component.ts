import { Component, inject, signal, OnInit, HostListener, ElementRef } from '@angular/core';
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
  templateUrl: './nueva-resena.component.html',
  styleUrl: './nueva-resena.component.scss'
})
export class NuevaResenaComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);
  private readonly elementRef = inject(ElementRef);

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
    this.loadDefaultSearchOptions();
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

  loadDefaultSearchOptions(): void {
    this.studentService.buscarCursoDocenteActivos().subscribe({
      next: (res) => {
        this.searchOptions.set(res);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false);
    }
  }

  onSearchInput(event: any): void {
    const val = event.target.value;
    if (!val || val.trim().length < 2) {
      this.loadDefaultSearchOptions();
      this.showDropdown.set(true);
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
    // Keep searchOptions loaded with default list for next time they open it
    this.loadDefaultSearchOptions();
    this.showDropdown.set(false);
  }

  clearSelection(): void {
    this.selectedOption.set(null);
    this.loadDefaultSearchOptions();
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
