import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CriterioResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-criterios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  templateUrl: './criterios.component.html',
  styleUrl: './criterios.component.scss'
})
export class CriteriosComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly criterios = signal<CriterioResponse[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  // Filters state
  readonly searchTerm = signal<string>('');
  filterEstado = '';

  // Reactively filter criteria list
  readonly filteredCriterios = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.criterios();
    if (!term) return list;
    return list.filter(crit => 
      crit.nombre.toLowerCase().includes(term) || 
      (crit.descripcion && crit.descripcion.toLowerCase().includes(term))
    );
  });

  readonly criterioForm = this.fb.group({
    nombre: ['', [Validators.required]],
    descripcion: ['']
  });

  get f() { return this.criterioForm.controls; }

  ngOnInit(): void {
    this.loadCriterios();
  }

  loadCriterios(): void {
    this.adminService.listarCriterios().subscribe({
      next: (res) => {
        let result = res;
        if (this.filterEstado) {
          result = result.filter(crit => crit.estado === this.filterEstado);
        }
        this.criterios.set(result);
      },
      error: () => this.uiService.showError('No se pudieron cargar los criterios.')
    });
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.criterioForm.reset();
    this.submitted.set(false);
  }

  openEditForm(crit: CriterioResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(crit.id);
    this.criterioForm.patchValue({
      nombre: crit.nombre,
      descripcion: crit.descripcion || ''
    });
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.criterioForm.reset();
  }

  toggleEstado(crit: CriterioResponse): void {
    const nuevoEstado = crit.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const msg = `¿Estás seguro de que deseas cambiar el estado del criterio "${crit.nombre}" a ${nuevoEstado}?`;
    
    this.uiService.confirm('Cambiar Estado', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.cambiarEstadoCriterio(crit.id, { estado: nuevoEstado }).subscribe({
          next: () => {
            this.uiService.showSuccess('Estado del criterio actualizado con éxito.');
            this.loadCriterios();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.criterioForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = {
      nombre: this.criterioForm.value.nombre || '',
      descripcion: this.criterioForm.value.descripcion || undefined
    };

    if (this.isEditMode()) {
      this.adminService.actualizarCriterio(this.selectedId()!, formVal).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Criterio actualizado con éxito.');
          this.closeForm();
          this.loadCriterios();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      this.adminService.crearCriterio(formVal).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Criterio creado con éxito.');
          this.closeForm();
          this.loadCriterios();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
