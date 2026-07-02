import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { AuthService } from '../../../core/auth/auth.service';
import { PublicResenaResponse, PromedioCriterioResponse } from '../../../core/models/public.models';
import { CarreraResponse } from '../../../core/models/admin.models';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StarRatingComponent,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    FormsModule
  ],
  template: `
    <div class="public-landing">
      <!-- Navbar overlay -->
      <nav class="public-nav">
        <div class="container d-flex justify-content-between align-items-center">
          <div class="brand">
            <i class="bi bi-star-fill text-gold me-2"></i>
            <strong>UTP+Recommends</strong>
          </div>
          <div class="actions">
            @if (authService.isAuthenticated()) {
              <a [routerLink]="dashboardRoute()" class="btn-primary-glass py-2">
                <i class="bi bi-grid me-2"></i>Mi Panel
              </a>
            } @else {
              <a routerLink="/auth/login" class="btn-secondary-glass me-2 py-2 text-decoration-none">Ingresar</a>
              <a routerLink="/auth/registro" class="btn-primary-glass py-2 text-decoration-none">Registrarse</a>
            }
          </div>
        </div>
      </nav>

      <!-- Hero Header -->
      <header class="hero-section text-center">
        <div class="container">
          <h1 class="display-4 fw-bold mb-3">Encuentra y comparte <span class="text-gradient">opiniones reales</span></h1>
          <p class="lead text-muted-custom mb-5">
            Plataforma oficial de recomendaciones de cursos y docentes de la UTP. Toma mejores decisiones para tu matrícula basándote en la experiencia de tus compañeros.
          </p>

          <!-- Search Filter Bar -->
          <div class="filter-bar glass-card text-start">
            <div class="row g-3">
              <div class="col-md-5">
                <label class="glass-form-label"><i class="bi bi-search me-1"></i> Buscar docente o curso</label>
                <input 
                  type="text" 
                  class="glass-input" 
                  placeholder="Ej: Análisis de Algoritmos, Carlos Pérez..."
                  [(ngModel)]="searchText"
                  (ngModelChange)="onFilterChange()"
                />
              </div>
              <div class="col-md-4">
                <label class="glass-form-label"><i class="bi bi-mortarboard me-1"></i> Carrera (Filtro)</label>
                <select 
                  class="glass-input" 
                  [(ngModel)]="selectedCarrera"
                  (ngModelChange)="onFilterChange()"
                >
                  <option [value]="0">Todas las carreras</option>
                  @for (carrera of carreras(); track carrera.id) {
                    <option [value]="carrera.id">{{ carrera.nombre }}</option>
                  }
                </select>
              </div>
              <div class="col-md-3 d-flex align-items-end">
                <button class="btn-primary-glass w-100 py-2.5" (click)="resetFilters()">
                  <i class="bi bi-arrow-counterclockwise me-2"></i>Limpiar
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Body -->
      <section class="reviews-section container py-5">
        <h2 class="h3 fw-bold mb-4">Reseñas Recientes</h2>

        @if (isLoading()) {
          <app-loading-skeleton type="card" [count]="3"></app-loading-skeleton>
        } @else if (filteredReviews.length === 0) {
          <app-empty-state 
            icon="bi-chat-left-dots-fill"
            title="Sin Reseñas Aprobadas" 
            description="Aún no hay reseñas registradas o ninguna coincide con tus filtros."
            [actionText]="authService.isAuthenticated() ? 'Escribir Reseña' : 'Iniciar Sesión para Escribir'"
            (action)="onEmptyStateAction()"
          ></app-empty-state>
        } @else {
          <div class="row g-4">
            @for (resena of filteredReviews; track resena.id) {
              <div class="col-md-6 col-lg-4">
                <div class="review-card glass-card">
                  <div class="card-header-custom d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 class="h5 fw-bold mb-1 text-white">{{ resena.docente }}</h3>
                      <span class="badge-badge badge-info">{{ resena.curso }}</span>
                    </div>
                    <div class="average-stars">
                      <app-star-rating [value]="calculateAverage(resena)" [readOnly]="true"></app-star-rating>
                    </div>
                  </div>
                  
                  <p class="comment-text text-muted-custom mb-3">
                    "{{ resena.comentario }}"
                  </p>

                  <!-- Criteria breakdown -->
                  <div class="criteria-list mb-3">
                    @for (cal of resena.calificaciones; track cal.criterio) {
                      <div class="criteria-item d-flex justify-content-between align-items-center mb-1">
                        <span class="criteria-name">{{ cal.criterio }}</span>
                        <div class="criteria-stars">
                          <span class="score-num me-2 text-gold font-monospace">{{ cal.puntaje }}</span>
                          <i class="bi bi-star-fill text-gold small"></i>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="card-footer-custom d-flex justify-content-between align-items-center pt-3">
                    <span class="student-name">
                      <i class="bi bi-person-fill me-1"></i>
                      {{ resena.esAnonimo ? 'Estudiante Anónimo' : resena.nombreEstudianteVisible }}
                    </span>
                    <span class="review-date">
                      {{ resena.fechaCreacion | date:'dd/MM/yyyy' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination Bar -->
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
      </section>
    </div>
  `,
  styles: [`
    .public-landing {
      min-height: 100vh;
      background: var(--bg-gradient);
    }
    .public-nav {
      height: 72px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      background: rgba(11, 19, 41, 0.3);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .brand {
      font-size: 1.3rem;
      color: #fff;
    }
    .hero-section {
      padding: 80px 0 40px;
    }
    .filter-bar {
      max-width: 800px;
      margin: 40px auto 0;
    }
    .review-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .comment-text {
      font-style: italic;
      line-height: 1.6;
      flex-grow: 1;
    }
    .criteria-list {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      padding: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .criteria-name {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .score-num {
      font-size: 0.85rem;
    }
    .card-footer-custom {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .student-name, .review-date {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .text-gradient {
      background: linear-gradient(135deg, #a5b4fc, #6366f1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class InicioComponent implements OnInit {
  private readonly publicService = inject(PublicService);
  readonly authService = inject(AuthService);

  readonly reviews = signal<PublicResenaResponse[]>([]);
  readonly carreras = signal<CarreraResponse[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Filters and pagination
  searchText = '';
  selectedCarrera = 0;
  currentPage = signal<number>(0);
  totalPages = signal<number>(0);

  filteredReviews: PublicResenaResponse[] = [];

  ngOnInit(): void {
    this.loadCarreras();
    this.loadReviews();
  }

  loadCarreras(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res),
      error: () => {}
    });
  }

  loadReviews(): void {
    this.isLoading.set(true);
    this.publicService.listarResenas(undefined, undefined, this.currentPage(), 9).subscribe({
      next: (res) => {
        this.reviews.set(res.content);
        this.totalPages.set(res.totalPages);
        this.applyClientFilters();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  applyClientFilters(): void {
    const rawText = this.searchText.toLowerCase().trim();
    this.filteredReviews = this.reviews().filter(r => {
      // Filter by text search
      const matchesText = !rawText || 
        r.docente.toLowerCase().includes(rawText) || 
        r.curso.toLowerCase().includes(rawText) ||
        r.comentario.toLowerCase().includes(rawText);

      // We don't have carreraId direct on PublicResenaResponse, but if careers are active 
      // we can simulate or since the API does it on server if needed.
      // For now, client filters will filter by text search.
      return matchesText;
    });
  }

  onFilterChange(): void {
    this.applyClientFilters();
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedCarrera = 0;
    this.applyClientFilters();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadReviews();
  }

  calculateAverage(resena: PublicResenaResponse): number {
    if (!resena.calificaciones || resena.calificaciones.length === 0) return 0;
    const sum = resena.calificaciones.reduce((acc, c) => acc + c.puntaje, 0);
    return sum / resena.calificaciones.length;
  }

  dashboardRoute(): string {
    const role = this.authService.userRole();
    return role === 'ADMIN' ? '/admin/inicio' : '/estudiante/inicio';
  }

  onEmptyStateAction(): void {
    if (this.authService.isAuthenticated()) {
      window.location.href = '/estudiante/resenas/nueva';
    } else {
      window.location.href = '/auth/login';
    }
  }
}
