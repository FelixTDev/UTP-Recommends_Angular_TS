import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PublicService } from '../../../core/services/public.service';
import { CursoResponse, CarreraResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.scss'
})
export class CursosComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly cursos = signal<CursoResponse[]>([]);
  readonly carreras = signal<CarreraResponse[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  
  readonly showCarreraSelect = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  // Filters state
  readonly searchTerm = signal<string>('');
  filterTipo = '';
  filterCarreraId = '';

  // Reactively filter courses list
  readonly filteredCursos = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    let list = this.cursos();

    // Client-side filtering by search term
    if (term) {
      list = list.filter(c => c.nombre.toLowerCase().includes(term));
    }

    return list;
  });

  readonly cursoForm = this.fb.group({
    nombre: ['', [Validators.required]],
    tipo: ['GENERAL', [Validators.required]],
    carreraId: ['']
  });

  get f() { return this.cursoForm.controls; }

  ngOnInit(): void {
    this.loadCursos();
    this.loadCarreras();
    
    // Watch Tipo changes to toggle and validate Carrera Select
    this.cursoForm.get('tipo')?.valueChanges.subscribe((tipo) => {
      this.updateCarreraValidation(tipo || 'GENERAL');
    });
  }

  loadCursos(): void {
    // If filters are active, we can apply them dynamically
    this.adminService.listarCursos().subscribe({
      next: (res) => {
        let result = res;
        
        // Filter by Tipo
        if (this.filterTipo) {
          result = result.filter(c => c.tipo === this.filterTipo);
        }
        
        // Filter by Carrera
        if (this.filterCarreraId) {
          result = result.filter(c => c.carreraId === Number(this.filterCarreraId));
        }
        
        this.cursos.set(result);
      },
      error: () => this.uiService.showError('No se pudieron cargar los cursos.')
    });
  }

  loadCarreras(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res)
    });
  }

  updateCarreraValidation(tipo: string): void {
    const carreraCtrl = this.cursoForm.get('carreraId');
    if (tipo === 'CARRERA') {
      this.showCarreraSelect.set(true);
      carreraCtrl?.setValidators([Validators.required]);
    } else {
      this.showCarreraSelect.set(false);
      carreraCtrl?.clearValidators();
      carreraCtrl?.setValue('');
    }
    carreraCtrl?.updateValueAndValidity();
  }

  getCarreraNombre(carreraId?: number): string {
    if (!carreraId) return 'Estudios Generales';
    const c = this.carreras().find(item => item.id === carreraId);
    return c ? c.nombre : `Carrera ID: ${carreraId}`;
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.cursoForm.reset({ tipo: 'GENERAL' });
    this.updateCarreraValidation('GENERAL');
    this.submitted.set(false);
  }

  openEditForm(curso: CursoResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(curso.id);
    this.cursoForm.patchValue({
      nombre: curso.nombre,
      tipo: curso.tipo,
      carreraId: curso.carreraId ? curso.carreraId.toString() : ''
    });
    this.updateCarreraValidation(curso.tipo);
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.cursoForm.reset();
  }

  inactivarCurso(curso: CursoResponse): void {
    const msg = `¿Estás seguro de que deseas inactivar el curso "${curso.nombre}"?`;
    
    this.uiService.confirm('Inactivar Curso', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.inactivarCurso(curso.id).subscribe({
          next: () => {
            this.uiService.showSuccess('Curso inactivado con éxito.');
            this.loadCursos();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.cursoForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = this.cursoForm.value;
    
    const payload = {
      nombre: formVal.nombre || '',
      tipo: formVal.tipo || 'GENERAL',
      carreraId: formVal.tipo === 'CARRERA' && formVal.carreraId ? Number(formVal.carreraId) : undefined,
      estado: 'ACTIVO'
    };

    if (this.isEditMode()) {
      this.adminService.actualizarCurso(this.selectedId()!, payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Curso actualizado con éxito.');
          this.closeForm();
          this.loadCursos();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      this.adminService.crearCurso(payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Curso creado con éxito.');
          this.closeForm();
          this.loadCursos();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
