import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PublicService } from '../../../core/services/public.service';
import { UiService } from '../../../core/services/ui.service';
import { CarreraResponse } from '../../../core/models/admin.models';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly publicService = inject(PublicService);
  private readonly uiService = inject(UiService);
  private readonly router = inject(Router);

  readonly registerForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^U[0-9]{8}@utp\.edu\.pe$/)]],
    nombres: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    carreraId: ['', [Validators.required]],
    password: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?_\-])[A-Za-z\d!@#$%&*?_\-]{8,}$/)
    ]]
  });

  readonly carreras = signal<CarreraResponse[]>([]);
  readonly submitted = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  get f() { return this.registerForm.controls; }

  ngOnInit(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res),
      error: () => this.uiService.showError('No se pudo cargar la lista de carreras activas.')
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  passwordStrength(): number {
    const val = this.registerForm.get('password')?.value || '';
    if (!val) return 0;
    let score = 0;

    // Check length
    if (val.length >= 8) score++;
    // Check both upper and lower case
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
    // Check digit
    if (/\d/.test(val)) score++;
    // Check special char
    if (/[!@#$%&*?_\-]/.test(val)) score++;

    return score;
  }

  getStrengthClass(): string {
    const score = this.passwordStrength();
    if (score === 0) return 'strength-empty';
    if (score === 1) return 'strength-weak';
    if (score === 2) return 'strength-fair';
    if (score === 3) return 'strength-good';
    return 'strength-strong';
  }

  getStrengthLabel(): string {
    const score = this.passwordStrength();
    if (score === 0) return 'Sin ingresar';
    if (score === 1) return 'Muy débil';
    if (score === 2) return 'Débil';
    if (score === 3) return 'Buena';
    return 'Muy segura';
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);

    // Construct payload ensuring carreraId is numeric
    const payload = {
      ...this.registerForm.value,
      carreraId: Number(this.registerForm.value.carreraId)
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.uiService.showSuccess('Cuenta creada correctamente. ¡Bienvenido!');
        this.router.navigate(['/estudiante/inicio']);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
