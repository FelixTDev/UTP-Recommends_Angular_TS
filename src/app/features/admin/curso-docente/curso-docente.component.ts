import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CursoDocenteResponse, CursoResponse, DocenteResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-curso-docente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  templateUrl: './curso-docente.component.html',
  styleUrl: './curso-docente.component.scss'
})
export class CursoDocenteComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly asignaciones = signal<CursoDocenteResponse[]>([]);
  readonly activeCursos = signal<CursoResponse[]>([]);
  readonly activeDocentes = signal<DocenteResponse[]>([]);
  
  readonly showForm = signal<boolean>(false);
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  // Filters state
  readonly searchTerm = signal<string>('');
  filterEstado = '';

  // Reactively filter assignments
  readonly filteredAsignaciones = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.asignaciones();
    if (!term) return list;
    return list.filter(a => 
      a.curso.toLowerCase().includes(term) || 
      a.docente.toLowerCase().includes(term)
    );
  });

  readonly assignForm = this.fb.group({
    cursoId: ['', [Validators.required]],
    docenteId: ['', [Validators.required]]
  });

  get f() { return this.assignForm.controls; }

  ngOnInit(): void {
    this.loadAsignaciones();
    this.loadActiveCatalogs();
  }

  loadAsignaciones(): void {
    this.adminService.listarAsignaciones().subscribe({
      next: (res) => {
        let result = res;
        if (this.filterEstado) {
          result = result.filter(a => a.estado === this.filterEstado);
        }
        this.asignaciones.set(result);
      },
      error: () => this.uiService.showError('No se pudieron cargar las asignaciones.')
    });
  }

  loadActiveCatalogs(): void {
    this.adminService.listarCursos().subscribe({
      next: (res) => this.activeCursos.set(res.filter(c => c.estado === 'ACTIVO'))
    });
    this.adminService.listarDocentes().subscribe({
      next: (res) => this.activeDocentes.set(res.filter(d => d.estado === 'ACTIVO'))
    });
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.assignForm.reset();
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.assignForm.reset();
  }

  toggleEstado(asig: CursoDocenteResponse): void {
    const nuevoEstado = asig.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const msg = `¿Estás seguro de que deseas cambiar el estado de la asignación de "${asig.docente}" en "${asig.curso}" a ${nuevoEstado}?`;
    
    this.uiService.confirm('Cambiar Estado', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.cambiarEstadoAsignacion(asig.id, { estado: nuevoEstado }).subscribe({
          next: () => {
            this.uiService.showSuccess('Estado de la asignación actualizado con éxito.');
            this.loadAsignaciones();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.assignForm.invalid) return;

    this.isLoadingForm.set(true);
    const payload = {
      cursoId: Number(this.assignForm.value.cursoId),
      docenteId: Number(this.assignForm.value.docenteId),
      estado: 'ACTIVO'
    };

    this.adminService.crearAsignacion(payload).subscribe({
      next: () => {
        this.isLoadingForm.set(false);
        this.uiService.showSuccess('Asignación creada con éxito.');
        this.closeForm();
        this.loadAsignaciones();
      },
      error: () => this.isLoadingForm.set(false)
    });
  }
}
