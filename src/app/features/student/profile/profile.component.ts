import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StudentService } from '../../../core/services/student.service';
import { AuthService } from '../../../core/services/auth.service';
import { UiService } from '../../../core/services/ui.service';
import { StudentProfileResponse } from '../../../core/models/student.models';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);

  readonly profile = signal<StudentProfileResponse | null>(null);
  readonly isUpdatingProfile = signal<boolean>(false);
  readonly isChangingPassword = signal<boolean>(false);

  readonly profileSubmitted = signal<boolean>(false);
  readonly passwordSubmitted = signal<boolean>(false);

  readonly profileForm: FormGroup = this.fb.group({
    nombres: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,100}$/)]]
  });

  readonly passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?_\-])[A-Za-z\d!@#$%&*?_\-]{8,}$/)
    ]]
  });

  get pf() { return this.profileForm.controls; }
  get pw() { return this.passwordForm.controls; }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.studentService.getProfile().subscribe({
      next: (res) => {
        this.profile.set(res);
        this.profileForm.patchValue({
          nombres: res.nombres,
          apellidos: res.apellidos
        });
      },
      error: () => this.uiService.showError('No se pudo cargar la información del perfil.')
    });
  }

  onUpdateProfile(): void {
    this.profileSubmitted.set(true);
    if (this.profileForm.invalid) return;

    this.isUpdatingProfile.set(true);
    this.studentService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.isUpdatingProfile.set(false);
        this.uiService.showSuccess('Perfil actualizado correctamente.');
        
        // Sync header state
        this.authService.fetchCurrentUser().subscribe();
        
        this.profile.set(res);
      },
      error: () => this.isUpdatingProfile.set(false)
    });
  }

  onChangePassword(): void {
    this.passwordSubmitted.set(true);
    if (this.passwordForm.invalid) return;

    this.isChangingPassword.set(true);
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.isChangingPassword.set(false);
        this.passwordForm.reset();
        this.passwordSubmitted.set(false);
        this.uiService.showSuccess('Contraseña cambiada correctamente.');
      },
      error: () => this.isChangingPassword.set(false)
    });
  }
}
