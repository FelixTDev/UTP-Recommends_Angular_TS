import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { PublicService } from '../../../core/services/public.service';
import { UiService } from '../../../core/services/ui.service';
import { CarreraResponse } from '../../../core/models/admin.models';

@Component({
  selector: 'app-nueva-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './nueva-solicitud.component.html',
  styleUrl: './nueva-solicitud.component.scss'
})
export class NuevaSolicitudComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);

  readonly solicitudForm: FormGroup = this.fb.group({
    tipo: ['CURSO_NUEVO', [Validators.required]],
    nombreCursoSugerido: [''],
    carreraSugeridaId: [''],
    nombresDocenteSugerido: [''],
    apellidosDocenteSugerido: [''],
    comentario: ['', [Validators.required, Validators.minLength(10)]]
  });

  readonly carreras = signal<CarreraResponse[]>([]);
  readonly showCourseFields = signal<boolean>(true);
  readonly showTeacherFields = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  get f() { return this.solicitudForm.controls; }

  ngOnInit(): void {
    this.loadCarreras();
    
    // Watch tipo changes to adjust conditional validation
    this.solicitudForm.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.updateConditionalValidators(tipo);
    });

    // Run initial validator setup
    this.updateConditionalValidators(this.solicitudForm.get('tipo')?.value);
  }

  loadCarreras(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res),
      error: () => {}
    });
  }

  updateConditionalValidators(tipo: string): void {
    const courseCtrl = this.solicitudForm.get('nombreCursoSugerido');
    const teacherNombresCtrl = this.solicitudForm.get('nombresDocenteSugerido');
    const teacherApellidosCtrl = this.solicitudForm.get('apellidosDocenteSugerido');

    if (tipo === 'CURSO_NUEVO') {
      this.showCourseFields.set(true);
      this.showTeacherFields.set(false);
      courseCtrl?.setValidators([Validators.required]);
      teacherNombresCtrl?.clearValidators();
      teacherApellidosCtrl?.clearValidators();
    } else if (tipo === 'DOCENTE_NUEVO') {
      this.showCourseFields.set(false);
      this.showTeacherFields.set(true);
      courseCtrl?.clearValidators();
      teacherNombresCtrl?.setValidators([Validators.required]);
      teacherApellidosCtrl?.setValidators([Validators.required]);
    } else if (tipo === 'AMBOS') {
      this.showCourseFields.set(true);
      this.showTeacherFields.set(true);
      courseCtrl?.setValidators([Validators.required]);
      teacherNombresCtrl?.setValidators([Validators.required]);
      teacherApellidosCtrl?.setValidators([Validators.required]);
    }

    courseCtrl?.updateValueAndValidity();
    teacherNombresCtrl?.updateValueAndValidity();
    teacherApellidosCtrl?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.solicitudForm.invalid) return;

    this.isLoading.set(true);

    const formVal = this.solicitudForm.value;

    const payload = {
      tipo: formVal.tipo,
      nombreCursoSugerido: this.showCourseFields() ? formVal.nombreCursoSugerido : undefined,
      carreraSugeridaId: this.showCourseFields() && formVal.carreraSugeridaId ? Number(formVal.carreraSugeridaId) : undefined,
      nombresDocenteSugerido: this.showTeacherFields() ? formVal.nombresDocenteSugerido?.trim() : undefined,
      apellidosDocenteSugerido: this.showTeacherFields() ? formVal.apellidosDocenteSugerido?.trim() : undefined,
      comentario: formVal.comentario
    };

    this.studentService.crearSolicitud(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.uiService.showSuccess('Solicitud enviada correctamente para revisión administrativa.');
        this.router.navigate(['/estudiante/solicitudes/mis-solicitudes']);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
