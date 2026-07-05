import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { CarreraResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-carreras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  templateUrl: './carreras.component.html',
  styleUrl: './carreras.component.scss'
})
export class CarrerasComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly carreras = signal<CarreraResponse[]>([]);
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  // Filters state
  readonly searchTerm = signal<string>('');
  filterEstado = '';

  // Reactively filter careers
  readonly filteredCarreras = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.carreras();
    if (!term) return list;
    return list.filter(c => c.nombre.toLowerCase().includes(term));
  });

  readonly carreraForm = this.fb.group({
    nombre: ['', [Validators.required]]
  });

  get f() { return this.carreraForm.controls; }

  ngOnInit(): void {
    this.loadCarreras();
  }

  loadCarreras(): void {
    // If filterEstado is set, we pass it, but wait!
    // The adminService.listarCarreras() doesn't accept query parameters for status in admin.service.ts:
    // listarCarreras(): Observable<CarreraResponse[]> { return this.http.get<CarreraResponse[]>(`${environment.apiUrl}/admin/carreras`); }
    // So we can filter the status on client side as well!
    this.adminService.listarCarreras().subscribe({
      next: (res) => {
        // If filterEstado is active, filter client side
        let result = res;
        if (this.filterEstado) {
          result = res.filter(c => c.estado === this.filterEstado);
        }
        this.carreras.set(result);
      },
      error: () => this.uiService.showError('No se pudieron cargar las carreras.')
    });
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.carreraForm.reset();
    this.submitted.set(false);
  }

  openEditForm(carrera: CarreraResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(carrera.id);
    this.carreraForm.patchValue({
      nombre: carrera.nombre
    });
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.carreraForm.reset();
  }

  inactivarCarrera(carrera: CarreraResponse): void {
    const msg = `¿Estás seguro de que deseas inactivar la carrera profesional "${carrera.nombre}"?`;
    
    this.uiService.confirm('Inactivar Carrera', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.inactivarCarrera(carrera.id).subscribe({
          next: () => {
            this.uiService.showSuccess('Carrera inactivada con éxito.');
            this.loadCarreras();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.carreraForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = {
      nombre: this.carreraForm.value.nombre || ''
    };

    if (this.isEditMode()) {
      this.adminService.actualizarCarrera(this.selectedId()!, formVal).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Carrera actualizada con éxito.');
          this.closeForm();
          this.loadCarreras();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      this.adminService.crearCarrera(formVal).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Carrera creada con éxito.');
          this.closeForm();
          this.loadCarreras();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
