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
import { buildSuggestedTeacherName, buildSuggestedTeacherSearchText } from '../../../core/utils/suggested-teacher-name.util';
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
  templateUrl: './moderacion-solicitudes.component.html',
  styleUrl: './moderacion-solicitudes.component.scss'
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
      buildSuggestedTeacherSearchText(sol.requestedData).includes(term) ||
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

  getSuggestedTeacherName(sol: ModeracionSolicitudResponse): string {
    return buildSuggestedTeacherName(sol.requestedData);
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
