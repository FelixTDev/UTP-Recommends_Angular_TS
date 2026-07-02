import { Injectable, inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  // Global loading state
  readonly isLoading = signal<boolean>(false);

  showSuccess(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['toast-success'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showError(message: string, duration = 5000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['toast-error'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showInfo(message: string, duration = 3000): void {
    this.snackBar.open(message, 'Cerrar', {
      duration,
      panelClass: ['toast-info'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  showLoading(): void {
    this.isLoading.set(true);
  }

  hideLoading(): void {
    this.isLoading.set(false);
  }

  confirm(title: string, message: string, confirmText = 'Confirmar', cancelText = 'Cancelar'): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title, message, confirmText, cancelText },
      disableClose: true
    });
    return dialogRef.afterClosed();
  }
}
