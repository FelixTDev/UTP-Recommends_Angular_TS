import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ModeracionResenaResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-moderacion-resenas',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgePipe,
    StarRatingComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    FormsModule
  ],
  template: `
    <div class="moderacion-resenas">
      <div class="row mb-4 align-items-center">
        <div class="col-md-7">
          <h1 class="h2 fw-bold text-white">Moderación de Reseñas</h1>
          <p class="text-muted-custom">Aprueba, rechaza u oculta reseñas académicas pendientes.</p>
        </div>
        <div class="col-md-5 text-md-end">
          <div class="d-inline-flex align-items-center bg-dark-opacity px-3 py-1.5 rounded border border-white-05">
            <label class="me-2 small text-muted-custom">Filtro Estado:</label>
            <select class="bg-transparent border-0 text-dark small" [(ngModel)]="filterEstado" (change)="loadQueue()">
              <option value="PENDIENTE">Pendientes únicamente</option>
              <option value="APROBADA">Aprobadas</option>
              <option value="RECHAZADA">Rechazadas</option>
              <option value="OCULTA">Ocultas</option>
            </select>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="list" [count]="3"></app-loading-skeleton>
      } @else if (queue().length === 0) {
        <app-empty-state 
          icon="bi-check2-all"
          title="Cola de Moderación Vacía" 
          description="¡Buen trabajo! No hay reseñas pendientes de moderar bajo este estado."
        ></app-empty-state>
      } @else {
        <div class="row g-4">
          @for (res of queue(); track res.idResena) {
            <div class="col-12">
              <div class="moderation-card glass-card">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom pb-3">
                  <div>
                    <span class="badge-badge badge-warning me-2">Reseña ID: #{{ res.idResena }}</span>
                    @let status = (res.estado | statusBadge);
                    <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                    <span class="text-muted-custom small ms-md-3">
                      <i class="bi bi-clock me-1"></i>Enviada el: {{ res.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                  <div class="student-info-tag small text-muted-custom">
                    Estudiante: <strong class="text-white">{{ res.estudiante.nombreCompleto }}</strong> ({{ res.estudiante.correo }})
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-md-9">
                    <h3 class="h5 fw-bold text-white mb-1">Docente: {{ res.docente.nombreCompleto }}</h3>
                    <span class="badge-badge badge-info mb-3">{{ res.curso.nombre }}</span>

                    <div class="comment-quote p-3 rounded mb-3 bg-dark-opacity font-style-italic">
                      "{{ res.comentario }}"
                    </div>
                  </div>

                  <!-- Scores sidebar -->
                  <div class="col-md-3">
                    <div class="scores-card p-3 rounded border border-white-05 bg-dark-opacity h-100">
                      <span class="d-block small text-muted-custom mb-2 fw-bold text-uppercase">Criterios:</span>
                      @for (cal of res.calificaciones; track cal.criterioId) {
                        <div class="d-flex justify-content-between align-items-center mb-2 small">
                          <span class="text-muted-custom">{{ cal.criterio }}</span>
                          <strong class="text-white font-monospace">{{ cal.puntaje }} <i class="bi bi-star-fill text-gold small"></i></strong>
                        </div>
                      }
                      <div class="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                        <span class="small fw-bold text-white">Promedio</span>
                        <strong class="text-gold">{{ calculateAverage(res) | number:'1.1-1' }} <i class="bi bi-star-fill text-gold small"></i></strong>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Controls overlay -->
                <div class="moderation-actions mt-4 pt-3 border-top d-flex flex-wrap gap-2 justify-content-end align-items-center">
                  
                  @if (activeRejectId() === res.idResena) {
                    <!-- Reject input overlay block -->
                    <div class="w-100 d-flex flex-column flex-md-row gap-2 align-items-end mt-2">
                      <div class="flex-grow-1 text-start">
                        <label class="glass-form-label text-danger">Motivo del Rechazo (Obligatorio)</label>
                        <input 
                          type="text" 
                          class="glass-input" 
                          placeholder="Especifica el motivo del rechazo (ej: Lenguaje inapropiado, spam...)"
                          [(ngModel)]="rejectReasonText"
                        />
                      </div>
                      <div class="d-flex gap-2">
                        <button class="btn btn-secondary py-2" (click)="cancelReject()">Cancelar</button>
                        <button class="btn btn-danger py-2" [disabled]="!rejectReasonText.trim()" (click)="confirmReject(res.idResena)">
                          Confirmar Rechazo
                        </button>
                      </div>
                    </div>
                  } @else {
                    <!-- Standard action buttons -->
                    @if (res.estado === 'PENDIENTE') {
                      <button class="btn btn-danger py-2 px-4" (click)="startReject(res.idResena)">
                        <i class="bi bi-x-lg me-2"></i>Rechazar
                      </button>
                      <button class="btn btn-success py-2 px-4" (click)="approve(res.idResena)">
                        <i class="bi bi-check-lg me-2"></i>Aprobar
                      </button>
                    }
                    @if (res.estado === 'APROBADA') {
                      <button class="btn btn-outline-danger py-2 px-4" (click)="hide(res.idResena)">
                        <i class="bi bi-eye-slash me-2"></i>Ocultar Reseña
                      </button>
                    }
                  }

                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .moderacion-resenas {
      color: var(--utp-text);
    }
    .bg-dark-opacity {
      background: var(--utp-surface-soft);
    }
    .border-white-05 {
      border: 1px solid var(--utp-border);
    }
    .comment-quote {
      border-left: 3px solid var(--utp-primary);
      line-height: 1.5;
    }
    .scores-card {
      font-size: 0.85rem;
    }
    .text-red {
      color: var(--utp-danger);
    }
  `]
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

  ngOnInit(): void {
    this.loadQueue();
  }

  loadQueue(): void {
    this.isLoading.set(true);
    this.adminService.listarResenasPendientes(this.filterEstado).subscribe({
      next: (res) => {
        this.queue.set(res);
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
