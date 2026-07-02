import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StudentService } from '../../../core/services/student.service';
import { StudentDashboardResponse } from '../../../core/models/student.models';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgePipe, LoadingSkeletonComponent],
  template: `
    <div class="student-dashboard">
      <div class="row mb-4">
        <div class="col">
          <h1 class="h2 fw-bold text-white">Mi Panel de Estudiante</h1>
          <p class="text-muted-custom">Resumen de tu actividad y contribución al sistema.</p>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="table" [count]="2"></app-loading-skeleton>
      } @else if (data()) {
        <!-- Metric Cards -->
        <div class="row g-4 mb-5">
          <!-- Total Reviews Card -->
          <div class="col-md-3">
            <div class="metric-card glass-card">
              <div class="icon-wrap bg-primary-opacity"><i class="bi bi-chat-quote-fill text-primary-color"></i></div>
              <div class="metric-val">{{ data()?.totalResenas }}</div>
              <div class="metric-label">Reseñas Realizadas</div>
            </div>
          </div>

          <!-- Approved Reviews Card -->
          <div class="col-md-3">
            <div class="metric-card glass-card">
              <div class="icon-wrap bg-success-opacity"><i class="bi bi-check-circle-fill text-success"></i></div>
              <div class="metric-val text-success">{{ data()?.resenasAprobadas }}</div>
              <div class="metric-label">Reseñas Aprobadas</div>
            </div>
          </div>

          <!-- Pending Reviews Card -->
          <div class="col-md-3">
            <div class="metric-card glass-card">
              <div class="icon-wrap bg-warning-opacity"><i class="bi bi-clock-history text-warning"></i></div>
              <div class="metric-val text-warning">{{ data()?.resenasPendientes }}</div>
              <div class="metric-label">Reseñas Pendientes</div>
            </div>
          </div>

          <!-- Requests Card -->
          <div class="col-md-3">
            <div class="metric-card glass-card">
              <div class="icon-wrap bg-info-opacity"><i class="bi bi-envelope-fill text-info"></i></div>
              <div class="metric-val text-info">{{ data()?.totalSolicitudes }}</div>
              <div class="metric-label">Solicitudes Enviadas</div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Recent Reviews List -->
          <div class="col-lg-6">
            <div class="glass-card h-100">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h5 fw-bold text-white mb-0">Últimas Reseñas</h2>
                <a routerLink="/estudiante/resenas/mis-resenas" class="text-gold small text-decoration-none">Ver todas</a>
              </div>

              @if (data()?.ultimasResenas?.length === 0) {
                <div class="text-center py-4">
                  <i class="bi bi-chat-left-dots text-muted fs-2 d-block mb-2"></i>
                  <span class="text-muted-custom">No tienes reseñas creadas.</span>
                  <a routerLink="/estudiante/resenas/nueva" class="text-gold d-block mt-2 text-decoration-none">Escribe tu primera reseña</a>
                </div>
              } @else {
                <div class="table-responsive">
                  <table class="table table-dark table-hover border-0 m-0 align-middle">
                    <thead>
                      <tr class="text-muted-custom font-size-sm">
                        <th>Curso</th>
                        <th>Docente</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (rev of data()?.ultimasResenas; track rev.id) {
                        <tr>
                          <td class="text-white">{{ rev.curso }}</td>
                          <td>{{ rev.docente }}</td>
                          <td>
                            @let status = (rev.estado | statusBadge);
                            <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                          </td>
                          <td class="text-muted-custom text-nowrap">{{ rev.fechaCreacion | date:'dd/MM/yyyy' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>

          <!-- Recent Requests List -->
          <div class="col-lg-6">
            <div class="glass-card h-100">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h5 fw-bold text-white mb-0">Últimas Solicitudes</h2>
                <a routerLink="/estudiante/solicitudes/mis-solicitudes" class="text-gold small text-decoration-none">Ver todas</a>
              </div>

              @if (data()?.ultimasSolicitudes?.length === 0) {
                <div class="text-center py-4">
                  <i class="bi bi-envelope-open text-muted fs-2 d-block mb-2"></i>
                  <span class="text-muted-custom">No tienes solicitudes pendientes.</span>
                  <a routerLink="/estudiante/solicitudes/nueva" class="text-gold d-block mt-2 text-decoration-none">Enviar una solicitud</a>
                </div>
              } @else {
                <div class="table-responsive">
                  <table class="table table-dark table-hover border-0 m-0 align-middle">
                    <thead>
                      <tr class="text-muted-custom font-size-sm">
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (req of data()?.ultimasSolicitudes; track req.id) {
                        <tr>
                          <td class="text-white">
                            @let typeInfo = (req.tipo | statusBadge);
                            <span class="badge-badge" [class]="typeInfo.class">{{ typeInfo.label }}</span>
                          </td>
                          <td>
                            @let status = (req.estado | statusBadge);
                            <span class="badge-badge" [class]="status.class">{{ status.label }}</span>
                          </td>
                          <td class="text-muted-custom text-nowrap">{{ req.fechaCreacion | date:'dd/MM/yyyy' }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .student-dashboard {
      color: var(--text-primary);
    }
    .metric-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px;
    }
    .icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 12px;
    }
    .bg-primary-opacity { background: rgba(79, 70, 229, 0.1); }
    .bg-success-opacity { background: rgba(16, 185, 129, 0.1); }
    .bg-warning-opacity { background: rgba(245, 158, 11, 0.1); }
    .bg-info-opacity { background: rgba(14, 165, 233, 0.1); }
    .text-primary-color { color: var(--primary-color); }
    
    .metric-val {
      font-size: 2.25rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 6px;
    }
    .metric-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .table {
      background: transparent !important;
    }
    .table th, .table td {
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      background: transparent !important;
      padding: 12px 8px;
    }
    .table th {
      font-weight: 600;
      color: var(--text-secondary);
    }
    .font-size-sm {
      font-size: 0.8rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly studentService = inject(StudentService);

  readonly data = signal<StudentDashboardResponse | null>(null);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.studentService.getDashboard().subscribe({
      next: (res) => {
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
