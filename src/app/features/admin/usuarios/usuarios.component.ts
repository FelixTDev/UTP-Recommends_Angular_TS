import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PublicService } from '../../../core/services/public.service';
import { UsuarioResponse, CarreraResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, StatusBadgePipe, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);

  readonly usuarios = signal<UsuarioResponse[]>([]);
  readonly carreras = signal<CarreraResponse[]>([]);
  
  readonly showForm = signal<boolean>(false);
  readonly isEditMode = signal<boolean>(false);
  readonly selectedId = signal<number | null>(null);
  readonly showCarreraSelect = signal<boolean>(true);
  
  readonly submitted = signal<boolean>(false);
  readonly isLoadingForm = signal<boolean>(false);

  // Filters and search state
  readonly searchTerm = signal<string>('');
  filterRol = '';
  filterEstado = '';

  // Reactively filter users list by search term
  readonly filteredUsuarios = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.usuarios();
    if (!term) return list;
    return list.filter(u => 
      u.nombres.toLowerCase().includes(term) || 
      u.apellidos.toLowerCase().includes(term) || 
      u.email.toLowerCase().includes(term) ||
      (u.codigoEstudiante && u.codigoEstudiante.toLowerCase().includes(term))
    );
  });

  readonly userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    nombres: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    rol: ['ESTUDIANTE', [Validators.required]],
    carreraId: ['']
  });

  get f() { return this.userForm.controls; }

  ngOnInit(): void {
    this.loadUsuarios();
    this.loadCarreras();

    // Watch rol changes to toggle and validate Carrera Select
    this.userForm.get('rol')?.valueChanges.subscribe((rol) => {
      this.updateCarreraValidation(rol || 'ESTUDIANTE');
    });
  }

  loadUsuarios(): void {
    const rol = this.filterRol ? this.filterRol : undefined;
    const estado = this.filterEstado ? this.filterEstado : undefined;

    this.adminService.listarUsuarios(rol, estado).subscribe({
      next: (res) => this.usuarios.set(res),
      error: () => this.uiService.showError('No se pudieron cargar los usuarios.')
    });
  }

  loadCarreras(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res)
    });
  }

  updateCarreraValidation(rol: string): void {
    const carreraCtrl = this.userForm.get('carreraId');
    if (rol === 'ESTUDIANTE') {
      this.showCarreraSelect.set(true);
      carreraCtrl?.setValidators([Validators.required]);
    } else {
      this.showCarreraSelect.set(false);
      carreraCtrl?.clearValidators();
      carreraCtrl?.setValue('');
    }
    carreraCtrl?.updateValueAndValidity();
  }

  openCreateForm(): void {
    this.showForm.set(true);
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.userForm.reset({ rol: 'ESTUDIANTE' });
    this.userForm.get('password')?.setValidators([
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?_\-])[A-Za-z\d!@#$%&*?_\-]{8,}$/)
    ]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.updateCarreraValidation('ESTUDIANTE');
    this.submitted.set(false);
  }

  openEditForm(usr: UsuarioResponse): void {
    this.showForm.set(true);
    this.isEditMode.set(true);
    this.selectedId.set(usr.id);
    this.userForm.patchValue({
      email: usr.email,
      nombres: usr.nombres,
      apellidos: usr.apellidos,
      rol: usr.rol,
      carreraId: usr.carreraId ? usr.carreraId.toString() : ''
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.updateCarreraValidation(usr.rol);
    this.submitted.set(false);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.userForm.reset();
  }

  changeStatus(usr: UsuarioResponse, estado: string): void {
    const msg = `¿Estás seguro de que deseas cambiar el estado del usuario "${usr.nombres}" a ${estado}?`;
    
    this.uiService.confirm('Cambiar Estado Usuario', msg).subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.cambiarEstadoUsuario(usr.id, { estado }).subscribe({
          next: () => {
            this.uiService.showSuccess('Estado del usuario actualizado con éxito.');
            this.loadUsuarios();
          }
        });
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.userForm.invalid) return;

    this.isLoadingForm.set(true);
    const formVal = this.userForm.value;

    if (this.isEditMode()) {
      const payload = {
        email: formVal.email || '',
        nombres: formVal.nombres || '',
        apellidos: formVal.apellidos || '',
        carreraId: formVal.rol === 'ESTUDIANTE' && formVal.carreraId ? Number(formVal.carreraId) : undefined
      };

      this.adminService.actualizarUsuario(this.selectedId()!, payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Usuario actualizado con éxito.');
          this.closeForm();
          this.loadUsuarios();
        },
        error: () => this.isLoadingForm.set(false)
      });
    } else {
      const payload = {
        email: formVal.email || '',
        password: formVal.password || '',
        nombres: formVal.nombres || '',
        apellidos: formVal.apellidos || '',
        rol: formVal.rol || 'ESTUDIANTE',
        carreraId: formVal.rol === 'ESTUDIANTE' && formVal.carreraId ? Number(formVal.carreraId) : undefined
      };

      this.adminService.crearUsuario(payload).subscribe({
        next: () => {
          this.isLoadingForm.set(false);
          this.uiService.showSuccess('Usuario creado con éxito.');
          this.closeForm();
          this.loadUsuarios();
        },
        error: () => this.isLoadingForm.set(false)
      });
    }
  }
}
