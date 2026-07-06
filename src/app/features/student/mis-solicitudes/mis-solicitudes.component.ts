import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { SolicitudResponse } from '../../../core/models/student.models';
import { buildSuggestedTeacherName } from '../../../core/utils/suggested-teacher-name.util';
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
  templateUrl: './mis-solicitudes.component.html',
  styleUrl: './mis-solicitudes.component.scss'
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

  getSuggestedTeacherName(sol: SolicitudResponse): string {
    return buildSuggestedTeacherName(sol);
  }
}
