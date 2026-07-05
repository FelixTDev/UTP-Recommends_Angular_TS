import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { AuthService } from '../../../core/services/auth.service';
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
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit, OnDestroy {
  private readonly publicService = inject(PublicService);
  private readonly router = inject(Router);
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

  // Carousel config
  slides = [
    {
      image: 'assets/CARRUSEL1.jpg',
      title: 'Toma mejores decisiones',
      description: 'Encuentra las valoraciones de tus compañeros sobre cursos y docentes antes de matricularte.'
    },
    {
      image: 'assets/CARRUSEL2.jpg',
      title: 'Evalúa con transparencia',
      description: 'Califica objetivamente basándote en criterios clave como puntualidad, didáctica y evaluación.'
    },
    {
      image: 'assets/CARRUSEL3.jpg',
      title: 'Comunidad Estudiantil UTP',
      description: 'Construyamos juntos una plataforma transparente para potenciar el rendimiento académico.'
    }
  ];
  activeSlide = signal<number>(0);
  private carouselInterval: any;



  // Campuses list
  readonly campuses = [
    'Arequipa', 'Chiclayo', 'Chimbote', 'Huancayo', 'Ica', 'Iquitos',
    'Lima Centro', 'Lima Este', 'Lima Norte', 'Lima Sur',
    'Piura', 'Pucallpa', 'Tacna', 'Trujillo'
  ];

  ngOnInit(): void {
    this.loadCarreras();
    this.loadReviews();
    this.startCarousel();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  // Carousel Logic
  startCarousel(): void {
    this.stopCarousel();
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopCarousel(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextSlide(): void {
    this.activeSlide.update(current => (current + 1) % this.slides.length);
  }

  prevSlide(): void {
    this.activeSlide.update(current => (current - 1 + this.slides.length) % this.slides.length);
  }

  setSlide(index: number): void {
    this.activeSlide.set(index);
    this.startCarousel();
  }



  // Card quality indicator class
  getCardScoreClass(resena: PublicResenaResponse): string {
    const avg = this.calculateAverage(resena);
    if (avg >= 4) return 'score-excellent';
    if (avg >= 3) return 'score-good';
    return 'score-regular';
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadCarreras(): void {
    this.publicService.listarCarrerasActivas().subscribe({
      next: (res) => this.carreras.set(res),
      error: () => { }
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
      this.router.navigate(['/estudiante/resenas/nueva']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
