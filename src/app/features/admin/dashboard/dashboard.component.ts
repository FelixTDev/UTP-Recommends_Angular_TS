import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AdminDashboardResponse } from '../../../core/models/admin.models';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSkeletonComponent],
  template: `
    <div class="admin-dashboard">
      <div class="row mb-4">
        <div class="col">
          <h1 class="h2 fw-bold text-white">Consola de Administración</h1>
          <p class="text-muted-custom">Resumen y métricas operacionales del sistema UTP+Recommends.</p>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="card" [count]="3"></app-loading-skeleton>
      } @else if (data()) {
        <!-- Metric Grid -->
        <div class="row g-4 mb-5">
          <!-- Pending Reviews -->
          <div class="col-md-4">
            <div class="metric-card glass-card text-center" routerLink="/admin/moderacion/resenas" style="cursor: pointer;">
              <div class="icon-wrap bg-warning-opacity"><i class="bi bi-chat-left-dots text-warning"></i></div>
              <div class="metric-val text-warning">{{ data()?.resenasPendientes }}</div>
              <div class="metric-label">Reseñas en Moderación</div>
              <small class="text-gold mt-2 d-block">Ir a cola <i class="bi bi-chevron-right small"></i></small>
            </div>
          </div>

          <!-- Pending Requests -->
          <div class="col-md-4">
            <div class="metric-card glass-card text-center" routerLink="/admin/moderacion/solicitudes" style="cursor: pointer;">
              <div class="icon-wrap bg-info-opacity"><i class="bi bi-envelope text-info"></i></div>
              <div class="metric-val text-info">{{ data()?.solicitudesPendientes }}</div>
              <div class="metric-label">Solicitudes de Cursos/Docentes</div>
              <small class="text-gold mt-2 d-block">Ir a cola <i class="bi bi-chevron-right small"></i></small>
            </div>
          </div>

          <!-- Active Users -->
          <div class="col-md-4">
            <div class="metric-card glass-card text-center" routerLink="/admin/usuarios" style="cursor: pointer;">
              <div class="icon-wrap bg-success-opacity"><i class="bi bi-people text-success"></i></div>
              <div class="metric-val text-success">{{ data()?.usuariosActivos }}</div>
              <div class="metric-label">Usuarios Activos</div>
              <small class="text-gold mt-2 d-block">Gestionar <i class="bi bi-chevron-right small"></i></small>
            </div>
          </div>

          <!-- Active Courses -->
          <div class="col-md-4">
            <div class="metric-card glass-card text-center" routerLink="/admin/cursos" style="cursor: pointer;">
              <div class="icon-wrap bg-primary-opacity"><i class="bi bi-book text-primary-color"></i></div>
              <div class="metric-val text-primary-color">{{ data()?.cursosActivos }}</div>
              <div class="metric-label">Cursos Registrados</div>
            </div>
          </div>

          <!-- Active Teachers -->
          <div class="col-md-4">
            <div class="metric-card glass-card text-center" routerLink="/admin/docentes" style="cursor: pointer;">
              <div class="icon-wrap bg-purple-opacity"><i class="bi bi-person-badge text-purple"></i></div>
              <div class="metric-val text-purple">{{ data()?.docentesActivos }}</div>
              <div class="metric-label">Docentes Registrados</div>
            </div>
          </div>

          <!-- Active Criteria -->
          <div class="col-md-4">
            <div class="metric-card glass-card text-center" routerLink="/admin/criterios" style="cursor: pointer;">
              <div class="icon-wrap bg-secondary-opacity"><i class="bi bi-patch-check text-white"></i></div>
              <div class="metric-val text-white">{{ data()?.criteriosActivos }}</div>
              <div class="metric-label">Criterios de Calificación</div>
            </div>
          </div>
        </div>

        <!-- Management shortcuts -->
        <div class="row">
          <div class="col">
            <div class="glass-card">
              <h2 class="h5 fw-bold text-white mb-3"><i class="bi bi-tools text-gold me-2"></i>Accesos Rápidos</h2>
              <div class="d-flex flex-wrap gap-3">
                <a routerLink="/admin/usuarios" class="btn-secondary-glass text-decoration-none"><i class="bi bi-people me-2"></i>Usuarios</a>
                <a routerLink="/admin/carreras" class="btn-secondary-glass text-decoration-none"><i class="bi bi-mortarboard me-2"></i>Carreras</a>
                <a routerLink="/admin/cursos" class="btn-secondary-glass text-decoration-none"><i class="bi bi-book me-2"></i>Cursos</a>
                <a routerLink="/admin/docentes" class="btn-secondary-glass text-decoration-none"><i class="bi bi-person-badge me-2"></i>Docentes</a>
                <a routerLink="/admin/curso-docente" class="btn-secondary-glass text-decoration-none"><i class="bi bi-link-45deg me-2"></i>Asignaciones</a>
                <a routerLink="/admin/criterios" class="btn-secondary-glass text-decoration-none"><i class="bi bi-patch-check me-2"></i>Criterios</a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard {
      color: var(--text-primary);
    }
    .metric-card {
      display: flex;
      flex-direction: column;
      align-items: center;
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
    .bg-purple-opacity { background: rgba(168, 85, 247, 0.1); }
    .bg-secondary-opacity { background: rgba(255, 255, 255, 0.05); }
    
    .text-primary-color { color: var(--primary-color); }
    .text-purple { color: #c084fc; }

    .metric-val {
      font-size: 2.25rem;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .metric-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly data = signal<AdminDashboardResponse | null>(null);
  readonly isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.adminService.getDashboard().subscribe({
      next: (res) => {
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}
