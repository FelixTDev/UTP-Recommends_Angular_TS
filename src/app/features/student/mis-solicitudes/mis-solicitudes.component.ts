import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { SolicitudResponse } from '../../../core/models/student.models';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-mis-solicitudes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatusBadgePipe,
    EmptyStateComponent,
    LoadingSkeletonComponent
  ],
  template: `
    <div class="mis-solicitudes">
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <h1 class="h2 fw-bold text-white">Mis Solicitudes</h1>
          <p class="text-muted-custom">Listado de solicitudes de nuevos cursos o docentes enviadas al administrador.</p>
        </div>
        <div class="col-md-4 text-md-end">
          <a routerLink="/estudiante/solicitudes/nueva" class="btn-primary-glass text-decoration-none">
            <i class="bi bi-send me-2"></i>Enviar Solicitud
          </a>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="list" [count]="3"></app-loading-skeleton>
      } @else if (solicitudes().length === 0) {
        <app-empty-state 
          icon="bi-envelope-open"
          title="Sin Solicitudes" 
          description="Aún no has enviado ninguna solicitud para agregar cursos o docentes."
          actionText="Enviar mi primera solicitud"
          (action)="onSendFirstRequest()"
        ></app-empty-state>
      } @else {
        <div class="row g-4">
          @for (sol of solicitudes(); track sol.id) {
            <div class="col-12">
              <div class="sol-row-card glass-card">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                  <div class="d-flex flex-wrap align-items-center gap-2">
                    <span class="badge-badge" [class]="(sol.tipo | statusBadge).class">
                      {{ (sol.tipo | statusBadge).label }}
                    </span>
                    @let status = (sol.estado | statusBadge);
                    <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                    <span class="text-muted-custom small ms-2">
                      <i class="bi bi-clock me-1"></i>{{ sol.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                  <div class="text-white fw-bold">ID: #{{ sol.id }}</div>
                </div>

                <!-- Suggestions content details -->
                <div class="row g-3 mb-3">
                  @if (sol.nombreCursoSugerido) {
                    <div class="col-md-6">
                      <span class="d-block small text-muted-custom">Curso Sugerido:</span>
                      <strong class="text-white">{{ sol.nombreCursoSugerido }}</strong>
                    </div>
                  }
                  @if (sol.nombreDocenteSugerido) {
                    <div class="col-md-6">
                      <span class="d-block small text-muted-custom">Docente Sugerido:</span>
                      <strong class="text-white">{{ sol.nombreDocenteSugerido }}</strong>
                    </div>
                  }
                </div>

                <div class="comment-block p-3 rounded mb-3 bg-dark-opacity">
                  <span class="d-block small text-muted-custom mb-1">Comentario adjunto:</span>
                  <p class="comment-text text-muted-custom mb-0 font-style-italic">"{{ sol.comentario }}"</p>
                </div>

                @if (sol.estado === 'RECHAZADA' && sol.motivoRechazo) {
                  <div class="alert alert-danger border-0 bg-danger-opacity text-red p-2.5 rounded mb-0 mt-3 small">
                    <strong>Motivo de rechazo:</strong> {{ sol.motivoRechazo }}
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div class="pagination-container d-flex justify-content-center mt-5">
            <button 
              class="btn-secondary-glass py-2 px-3 me-2" 
              [disabled]="currentPage() === 0"
              (click)="changePage(currentPage() - 1)"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <span class="align-self-center mx-3 text-muted-custom">
              Pág. <strong>{{ currentPage() + 1 }}</strong> de {{ totalPages() }}
            </span>
            <button 
              class="btn-secondary-glass py-2 px-3" 
              [disabled]="currentPage() >= totalPages() - 1"
              (click)="changePage(currentPage() + 1)"
            >
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .mis-solicitudes {
      color: var(--utp-text);
    }
    .sol-row-card {
      transition: transform 0.2s ease;
    }
    .sol-row-card:hover {
      transform: scale(1.005);
    }
    .bg-dark-opacity {
      background: var(--utp-surface-soft);
    }
    .comment-text {
      line-height: 1.5;
    }
    .bg-danger-opacity {
      background: rgba(220, 38, 38, 0.1);
    }
    .text-red {
      color: var(--utp-danger);
    }
  `]
})
export class MisSolicitudesComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);

  readonly solicitudes = signal<SolicitudResponse[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Pagination
  readonly currentPage = signal<number>(0);
  readonly totalPages = signal<number>(0);

  ngOnInit(): void {
    this.loadSolicitudes();
  }

  loadSolicitudes(): void {
    this.isLoading.set(true);
    this.studentService.listarMisSolicitudes(this.currentPage(), 5).subscribe({
      next: (res) => {
        this.solicitudes.set(res.content);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSendFirstRequest(): void {
    this.router.navigate(['/estudiante/solicitudes/nueva']);
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadSolicitudes();
  }
}
