import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ModeracionResenaResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-moderacion-resenas',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgePipe,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    FormsModule
  ],
  templateUrl: './moderacion-resenas.component.html',
  styleUrl: './moderacion-resenas.component.scss'
})
export class ModeracionResenasComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);

  readonly queue = signal<ModeracionResenaResponse[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Reject state
  readonly activeRejectId = signal<number | null>(null);
  rejectReasonText = '';

  filterEstado = 'PENDIENTE';
  readonly searchTerm = signal<string>('');

  // Computed signal for dynamic client side search
  readonly filteredQueue = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.queue();
    if (!term) return list;
    return list.filter(r => 
      r.curso.nombre.toLowerCase().includes(term) || 
      r.docente.nombreCompleto.toLowerCase().includes(term) || 
      r.comentario.toLowerCase().includes(term) ||
      (r.estudiante && r.estudiante.nombreCompleto.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.loadQueue();
  }

  loadQueue(): void {
    this.isLoading.set(true);
    this.adminService.listarResenasPendientes(this.filterEstado).subscribe({
      next: (res) => {
        // Fallback filter in client-side to safeguard in case backend API ignores the estado parameter 
        // and returns all reviews or doesn't support other state listings
        let list = res;
        if (res && res.length > 0) {
          // If the backend returned items that do not match the current filterEstado, 
          // filter them out client-side so they don't corrupt the view
          list = res.filter(r => r.estado === this.filterEstado);
        }
        this.queue.set(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  calculateAverage(res: ModeracionResenaResponse): number {
    if (!res.calificaciones || res.calificaciones.length === 0) return 0;
    const sum = res.calificaciones.reduce((acc, c) => acc + c.puntaje, 0);
    return sum / res.calificaciones.length;
  }



  approve(id: number): void {
    this.uiService.confirm('Aprobar Reseña', '¿Estás seguro de que deseas aprobar esta reseña para que sea pública?').subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.aprobarResena(id).subscribe({
          next: () => {
            this.uiService.showSuccess('Reseña aprobada con éxito.');
            this.loadQueue();
          }
        });
      }
    });
  }

  startReject(id: number): void {
    this.activeRejectId.set(id);
    this.rejectReasonText = '';
  }

  cancelReject(): void {
    this.activeRejectId.set(null);
    this.rejectReasonText = '';
  }

  confirmReject(id: number): void {
    if (!this.rejectReasonText.trim()) return;

    this.adminService.rechazarResena(id, { motivoRechazo: this.rejectReasonText.trim() }).subscribe({
      next: () => {
        this.uiService.showSuccess('Reseña rechazada con éxito.');
        this.cancelReject();
        this.loadQueue();
      }
    });
  }

  hide(id: number): void {
    this.uiService.confirm('Ocultar Reseña', '¿Estás seguro de que deseas ocultar esta reseña aprobada?').subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.ocultarResena(id).subscribe({
          next: () => {
            this.uiService.showSuccess('Reseña ocultada con éxito.');
            this.loadQueue();
          }
        });
      }
    });
  }
}
