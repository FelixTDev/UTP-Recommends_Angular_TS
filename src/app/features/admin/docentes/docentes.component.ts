import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DocenteResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-docentes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.scss'
})
export class DocentesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly docentes = signal<DocenteResponse[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  // Filters state
  readonly searchTerm = signal<string>('');
  filterEstado = '';

  // Reactively filter teachers
  readonly filteredDocentes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.docentes();
    if (!term) return list;
    return list.filter(d => 
      d.nombres.toLowerCase().includes(term) || 
      d.apellidos.toLowerCase().includes(term) || 
      (d.email && d.email.toLowerCase().includes(term))
    );
  });

  readonly docenteForm = this.fb.group({
    nombres: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    email: ['', [Validators.email]]
  });

  get f() { return this.docenteForm.controls; }

  ngOnInit(): void {
    this.loadDocentes();
  }

  loadDocentes(): void {
    this.adminService.listarDocentes().subscribe({
      next: (res) => {
        let result = res;
        if (this.filterEstado) {
          result = result.filter(d => d.estado === this.filterEstado);
        }
        this.docentes.set(result);
      },
      error: () => this.uiService.showError('No se pudieron cargar los docentes.')
    });
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.docenteForm.reset();
    this.submitted.set(false);
  }

  openEditForm(doc: DocenteResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(doc.id);
    this.docenteForm.patchValue({
      nombres: doc.nombres,
      apellidos: doc.apellidos,
      email: doc.email || ''
    });
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.docenteForm.reset();
  }

  toggleEstado(doc: DocenteResponse): void {
    const nuevoEstado = doc.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const accion = nuevoEstado === 'ACTIVO' ? 'activar' : 'inactivar';
    const msg = `¿Estás seguro de que deseas ${accion} el docente "${doc.nombres} ${doc.apellidos}"?`;
    
    this.uiService.confirm(`${nuevoEstado === 'ACTIVO' ? 'Activar' : 'Inactivar'} Docente`, msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.cambiarEstadoDocente(doc.id, { estado: nuevoEstado }).subscribe({
          next: () => {
            this.uiService.showSuccess(`Docente ${accion}ado con éxito.`);
            this.loadDocentes();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.docenteForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = this.docenteForm.value;
    const payload = {
      nombres: formVal.nombres || '',
      apellidos: formVal.apellidos || '',
      email: formVal.email || undefined
    };

    if (this.isEditMode()) {
      this.adminService.actualizarDocente(this.selectedId()!, payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Docente actualizado con éxito.');
          this.closeForm();
          this.loadDocentes();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      this.adminService.crearDocente(payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Docente creado con éxito.');
          this.closeForm();
          this.loadDocentes();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
