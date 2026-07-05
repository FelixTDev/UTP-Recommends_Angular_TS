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
  templateUrl: './mis-resenas.component.html',
  styleUrl: './mis-resenas.component.scss'
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
