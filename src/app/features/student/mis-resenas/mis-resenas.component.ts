import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { ResenaResponse } from '../../../core/models/student.models';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-mis-resenas',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StatusBadgePipe,
    StarRatingComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent
  ],
  template: `
    <div class="mis-resenas">
      <div class="row mb-4 align-items-center">
        <div class="col-md-8">
          <h1 class="h2 fw-bold text-white">Mis Reseñas</h1>
          <p class="text-muted-custom">Historial de calificaciones y comentarios que has publicado.</p>
        </div>
        <div class="col-md-4 text-md-end">
          <a routerLink="/estudiante/resenas/nueva" class="btn-primary-glass text-decoration-none">
            <i class="bi bi-pencil-square me-2"></i>Escribir Reseña
          </a>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="list" [count]="3"></app-loading-skeleton>
      } @else if (resenas().length === 0) {
        <app-empty-state 
          icon="bi-chat-left-text"
          title="Sin Reseñas" 
          description="Aún no has escrito ninguna reseña de docentes en el sistema."
          actionText="Escribir mi primera reseña"
          (action)="onWriteFirstReview()"
        ></app-empty-state>
      } @else {
        <div class="row g-4">
          @for (resena of resenas(); track resena.id) {
            <div class="col-12">
              <div class="review-row-card glass-card">
                <div class="row g-3">
                  <!-- Header details -->
                  <div class="col-md-9">
                    <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <h3 class="h5 fw-bold text-white mb-0">{{ resena.docente }}</h3>
                      <span class="badge-badge badge-primary">{{ resena.curso }}</span>
                      @let status = (resena.estado | statusBadge);
                      <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                      <span class="text-muted-custom small ms-md-2">Versión {{ resena.version }}</span>
                    </div>
                    <div class="d-flex align-items-center mb-3">
                      <app-star-rating [value]="calculateAverage(resena)" [readOnly]="true" [showValue]="true"></app-star-rating>
                      <span class="text-muted-custom small ms-3">
                        <i class="bi bi-clock me-1"></i>{{ resena.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
                      </span>
                    </div>

                    <p class="comment-text text-muted-custom mb-3">
                      "{{ resena.comentario }}"
                    </p>

                    <!-- Criteria Ratings -->
                    <div class="ratings-mini-grid d-flex flex-wrap gap-3 p-2.5 rounded bg-dark-opacity mb-3">
                      @for (cal of resena.calificaciones; track cal.criterioId) {
                        <div class="rating-mini-item">
                          <span class="criteria-label d-block text-muted-custom">{{ cal.criterio }}</span>
                          <strong class="text-white">{{ cal.puntaje }} <i class="bi bi-star-fill text-gold small"></i></strong>
                        </div>
                      }
                    </div>

                    <!-- Observation for rejected review -->
                    @if (resena.estado === 'RECHAZADA' && resena.motivoRechazo) {
                      <div class="alert alert-danger border-0 bg-danger-opacity text-red p-2.5 rounded mb-0 mt-3 small">
                        <strong>Motivo de rechazo:</strong> {{ resena.motivoRechazo }}
                      </div>
                    }
                  </div>

                  <!-- Actions column -->
                  <div class="col-md-3 d-flex flex-column justify-content-center align-items-md-end">
                    @if (resena.estado === 'RECHAZADA') {
                      <button 
                        class="btn-primary-glass py-2 px-3 text-nowrap w-100" 
                        (click)="onResubmit(resena.id)"
                      >
                        <i class="bi bi-pencil-square me-2"></i>Corregir y Reenviar
                      </button>
                    }
                    <div class="text-muted-custom small mt-2">
                      {{ resena.esAnonimo ? 'Publicado Anónimamente' : 'Publicado Visiblemente' }}
                    </div>
                  </div>
                </div>
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
    .mis-resenas {
      color: var(--text-primary);
    }
    .review-row-card {
      transition: transform 0.2s ease;
    }
    .review-row-card:hover {
      transform: scale(1.005);
    }
    .comment-text {
      font-style: italic;
      line-height: 1.5;
    }
    .bg-dark-opacity {
      background: rgba(0, 0, 0, 0.2);
    }
    .ratings-mini-grid {
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .rating-mini-item {
      font-size: 0.85rem;
    }
    .criteria-label {
      font-size: 0.75rem;
    }
    .bg-danger-opacity {
      background: rgba(239, 68, 68, 0.1);
    }
    .text-red {
      color: #f87171;
    }
  `]
})
export class MisResenasComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly router = inject(Router);

  readonly resenas = signal<ResenaResponse[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Pagination
  readonly currentPage = signal<number>(0);
  readonly totalPages = signal<number>(0);

  ngOnInit(): void {
    this.loadResenas();
  }

  loadResenas(): void {
    this.isLoading.set(true);
    this.studentService.listarMisResenas(this.currentPage(), 5).subscribe({
      next: (res) => {
        this.resenas.set(res.content);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  calculateAverage(resena: ResenaResponse): number {
    if (!resena.calificaciones || resena.calificaciones.length === 0) return 0;
    const sum = resena.calificaciones.reduce((acc, c) => acc + c.puntaje, 0);
    return sum / resena.calificaciones.length;
  }

  onResubmit(id: number): void {
    this.router.navigate(['/estudiante/resenas/nueva'], { queryParams: { rejectedId: id } });
  }

  onWriteFirstReview(): void {
    this.router.navigate(['/estudiante/resenas/nueva']);
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadResenas();
  }
}
