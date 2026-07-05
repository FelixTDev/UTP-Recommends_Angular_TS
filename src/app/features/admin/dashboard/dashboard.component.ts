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
      <!-- Header Row with System Status and Date -->
      <div class="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 class="h2 fw-bold text-dark-title mb-1">Consola de Administración</h1>
          <p class="text-muted-custom mb-0">Resumen y métricas operacionales del sistema UTP+Recommends.</p>
        </div>
        
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <!-- Status Indicator Widget -->
          <div class="status-widget">
            <span class="status-dot pulsing"></span>
            <span class="status-text text-dark-title">Servidores: <strong class="text-success">Online</strong></span>
          </div>
          <!-- Date Widget -->
          <div class="date-widget">
            <i class="bi bi-calendar-date text-gold me-2"></i>
            <span class="text-dark-title font-monospace">{{ currentDate }}</span>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="card" [count]="3"></app-loading-skeleton>
      } @else if (data()) {
        <!-- SECTION 1: ATTENTION REQUIRED (Moderation Queues) -->
        <div class="section-title-wrap mb-3">
          <h2 class="h5 fw-bold text-dark-title"><i class="bi bi-exclamation-triangle-fill text-gold me-2"></i>Atención Requerida</h2>
          <span class="divider-line"></span>
        </div>

        <div class="row g-4 mb-5">
          <!-- Pending Reviews Card -->
          <div class="col-md-6">
            <div class="metric-card attention-card glass-card warning-border" routerLink="/admin/moderacion/resenas" style="cursor: pointer;">
              <div class="row align-items-center w-100 g-0">
                <div class="col-auto me-3">
                  <div class="icon-wrap bg-warning-gradient"><i class="bi bi-chat-left-dots text-white"></i></div>
                </div>
                <div class="col text-start">
                  <div class="d-flex align-items-baseline gap-2 mb-1">
                    <span class="metric-val text-warning font-monospace">{{ data()?.resenasPendientes }}</span>
                    <span class="metric-label text-dark-title">Reseñas en Moderación</span>
                  </div>
                  <p class="metric-desc text-muted-custom mb-0 d-none d-sm-block">Opiniones estudiantiles pendientes de aprobación en el sistema.</p>
                </div>
                <div class="col-auto text-end ms-3">
                  <span class="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1.5 rounded-pill mb-2 d-none d-md-inline-block font-monospace">Pendientes</span>
                  <div class="arrow-btn ms-auto"><i class="bi bi-arrow-right"></i></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Requests Card -->
          <div class="col-md-6">
            <div class="metric-card attention-card glass-card info-border" routerLink="/admin/moderacion/solicitudes" style="cursor: pointer;">
              <div class="row align-items-center w-100 g-0">
                <div class="col-auto me-3">
                  <div class="icon-wrap bg-info-gradient"><i class="bi bi-envelope-paper-fill text-white"></i></div>
                </div>
                <div class="col text-start">
                  <div class="d-flex align-items-baseline gap-2 mb-1">
                    <span class="metric-val text-info font-monospace">{{ data()?.solicitudesPendientes }}</span>
                    <span class="metric-label text-dark-title">Solicitudes de Cursos/Docentes</span>
                  </div>
                  <p class="metric-desc text-muted-custom mb-0 d-none d-sm-block">Peticiones de alumnos para añadir nuevas asignaturas o catedráticos.</p>
                </div>
                <div class="col-auto text-end ms-3">
                  <span class="badge bg-info-subtle text-info border border-info-subtle px-2.5 py-1.5 rounded-pill mb-2 d-none d-md-inline-block font-monospace">Solicitudes</span>
                  <div class="arrow-btn ms-auto"><i class="bi bi-arrow-right"></i></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 2: SYSTEM INVENTORY (General stats) -->
        <div class="section-title-wrap mb-3">
          <h2 class="h5 fw-bold text-dark-title"><i class="bi bi-database-fill text-gold me-2"></i>Inventario General</h2>
          <span class="divider-line"></span>
        </div>

        <div class="row g-4 mb-5">
          <!-- Active Users -->
          <div class="col-md-3 col-sm-6">
            <div class="metric-card glass-card inventory-card success-border text-center" routerLink="/admin/usuarios" style="cursor: pointer;">
              <div class="icon-wrap bg-success-opacity"><i class="bi bi-people text-success"></i></div>
              <div class="metric-val text-success font-monospace">{{ data()?.usuariosActivos }}</div>
              <div class="metric-label text-dark-title">Usuarios Activos</div>
              <div class="mini-status"><span class="status-dot bg-success"></span> Registrados</div>
            </div>
          </div>

          <!-- Active Courses -->
          <div class="col-md-3 col-sm-6">
            <div class="metric-card glass-card inventory-card primary-border text-center" routerLink="/admin/cursos" style="cursor: pointer;">
              <div class="icon-wrap bg-primary-opacity"><i class="bi bi-book text-primary-color"></i></div>
              <div class="metric-val text-primary-color font-monospace">{{ data()?.cursosActivos }}</div>
              <div class="metric-label text-dark-title">Cursos Registrados</div>
              <div class="mini-status"><span class="status-dot bg-danger"></span> Académicos</div>
            </div>
          </div>

          <!-- Active Teachers -->
          <div class="col-md-3 col-sm-6">
            <div class="metric-card glass-card inventory-card purple-border text-center" routerLink="/admin/docentes" style="cursor: pointer;">
              <div class="icon-wrap bg-purple-opacity"><i class="bi bi-person-badge text-purple"></i></div>
              <div class="metric-val text-purple font-monospace">{{ data()?.docentesActivos }}</div>
              <div class="metric-label text-dark-title">Docentes Registrados</div>
              <div class="mini-status"><span class="status-dot bg-purple"></span> Catedráticos</div>
            </div>
          </div>

          <!-- Active Criteria -->
          <div class="col-md-3 col-sm-6">
            <div class="metric-card glass-card inventory-card grey-border text-center" routerLink="/admin/criterios" style="cursor: pointer;">
              <div class="icon-wrap bg-secondary-opacity"><i class="bi bi-patch-check text-grey"></i></div>
              <div class="metric-val text-grey font-monospace">{{ data()?.criteriosActivos }}</div>
              <div class="metric-label text-dark-title">Criterios de Calificación</div>
              <div class="mini-status"><span class="status-dot bg-secondary"></span> Activos</div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: QUICK UTILITIES GRID -->
        <div class="row g-4 mb-5">
          <div class="col-12">
            <div class="glass-card p-4">
              <h2 class="h5 fw-bold text-dark-title mb-4"><i class="bi bi-tools text-gold me-2"></i>Accesos Rápidos del Sistema</h2>
              
              <div class="row g-3">
                @for (shortcut of shortcuts; track shortcut.path) {
                  <div class="col-lg-4 col-md-6">
                    <a [routerLink]="shortcut.path" class="shortcut-item-card d-flex align-items-start gap-3 text-decoration-none">
                      <div class="shortcut-icon" [ngClass]="shortcut.iconBg">
                        <i class="bi" [class]="shortcut.icon"></i>
                      </div>
                      <div class="shortcut-info text-start">
                        <h4 class="shortcut-name text-dark-title">{{ shortcut.label }}</h4>
                        <p class="shortcut-desc text-muted-custom mb-0">{{ shortcut.description }}</p>
                      </div>
                      <i class="bi bi-chevron-right ms-auto arrow-icon text-muted"></i>
                    </a>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 4: LIVE SYSTEM LOGS -->
        <div class="row">
          <div class="col-12">
            <div class="glass-card p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h2 class="h5 fw-bold text-dark-title mb-0"><i class="bi bi-activity text-gold me-2"></i>Registro de Actividad Reciente</h2>
                <span class="badge bg-light text-dark border font-monospace px-3.5 py-1.5 rounded-pill">Auditoría Real</span>
              </div>
              
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th class="text-dark-title py-3">Fecha y Hora</th>
                      <th class="text-dark-title py-3">Evento</th>
                      <th class="text-dark-title py-3">Descripción</th>
                      <th class="text-dark-title py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    @if (systemLogs().length === 0) {
                      <tr>
                        <td colspan="4" class="text-center py-4 text-muted-custom">
                          Cargando actividad reciente...
                        </td>
                      </tr>
                    } @else {
                      @for (log of systemLogs(); track log.description) {
                        <tr>
                          <td class="text-muted-custom font-monospace">{{ log.timeStr }}</td>
                          <td>
                            <span class="badge rounded-pill px-2.5 py-1.5 border" [ngClass]="log.eventClass" style="font-size: 0.72rem;">
                              {{ log.event }}
                            </span>
                          </td>
                          <td class="text-dark-title fw-medium text-start">{{ log.description }}</td>
                          <td>
                            <div class="d-flex align-items-center gap-1.5">
                              <span class="status-dot" [ngClass]="log.statusClass"></span>
                              <span class="text-muted-custom" style="font-size: 0.82rem;">{{ log.status }}</span>
                            </div>
                          </td>
                        </tr>
                      }
                    }
                  </tbody>
                </table>
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
    .text-dark-title {
      color: #0f172a !important;
    }
    
    /* Header Widgets */
    .status-widget {
      background: rgba(5, 150, 105, 0.05);
      border: 1px solid rgba(5, 150, 105, 0.15);
      padding: 8px 16px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      font-size: 0.88rem;
    }
    .date-widget {
      background: rgba(255, 255, 255, 0.7);
      border: 1px solid var(--utp-border);
      padding: 8px 16px;
      border-radius: 30px;
      display: flex;
      align-items: center;
      font-size: 0.88rem;
      box-shadow: 0 4px 10px rgba(0,0,0,0.01);
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .status-dot.pulsing {
      background: var(--utp-success);
      box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7);
      animation: pulseGlowGreen 2s infinite;
      margin-right: 8px;
    }
    @keyframes pulseGlowGreen {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(5, 150, 105, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
    }

    /* Section titles */
    .section-title-wrap {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .divider-line {
      flex-grow: 1;
      height: 1px;
      background: linear-gradient(to right, var(--utp-border) 0%, rgba(229, 231, 235, 0) 100%);
    }

    /* Metric Cards Base */
    .metric-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid var(--utp-border);
      border-radius: 16px;
    }
    .metric-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.04);
      background: #ffffff;
    }
    .metric-val {
      font-size: 2.2rem;
      font-weight: 800;
      margin-bottom: 2px;
      line-height: 1;
      display: inline-block;
    }
    .metric-label {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 4px;
      display: inline-block;
    }
    .metric-desc {
      font-size: 0.8rem;
    }
    
    /* Attention Card */
    .attention-card {
      padding: 24px 30px;
    }
    .warning-border { border-left: 5px solid var(--utp-warning) !important; }
    .info-border { border-left: 5px solid var(--utp-info) !important; }
    
    .icon-wrap {
      width: 54px;
      height: 54px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .bg-warning-gradient {
      background: linear-gradient(135deg, var(--utp-warning) 0%, #b45309 100%);
    }
    .bg-info-gradient {
      background: linear-gradient(135deg, var(--utp-info) 0%, #0369a1 100%);
    }
    
    .arrow-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--utp-border-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--utp-text-secondary);
      transition: all 0.3s ease;
    }
    .attention-card:hover .arrow-btn {
      background: var(--utp-primary);
      color: #ffffff;
      transform: translateX(4px);
    }

    /* Inventory Cards */
    .inventory-card {
      padding: 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      height: 100%;
    }
    .inventory-card .icon-wrap {
      margin-bottom: 16px;
    }
    .inventory-card .metric-val {
      margin-bottom: 6px;
    }
    .inventory-card .metric-label {
      margin-bottom: 10px;
      font-size: 0.9rem;
      line-height: 1.3;
      min-height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .success-border { border-top: 4px solid var(--utp-success) !important; }
    .primary-border { border-top: 4px solid var(--utp-primary) !important; }
    .purple-border { border-top: 4px solid #7c3aed !important; }
    .grey-border { border-top: 4px solid #6b7280 !important; }
    
    .bg-success-opacity { background: rgba(5, 150, 105, 0.08); }
    .bg-primary-opacity { background: rgba(255, 23, 68, 0.08); }
    .bg-purple-opacity { background: rgba(124, 58, 237, 0.08); }
    .bg-secondary-opacity { background: rgba(107, 114, 128, 0.08); }
    
    .text-primary-color { color: var(--utp-primary); }
    .text-purple { color: #7c3aed; }
    .text-grey { color: #4b5563; }
    
    .mini-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.76rem;
      color: var(--utp-text-secondary);
      margin-top: 4px;
    }
    .mini-status .status-dot {
      width: 6px;
      height: 6px;
    }

    /* Shortcut Grid */
    .shortcut-item-card {
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid var(--utp-border);
      border-radius: 16px;
      padding: 18px 22px;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .shortcut-item-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 23, 68, 0.25);
      box-shadow: 0 10px 20px rgba(0,0,0,0.02);
      background: #ffffff;
    }
    .shortcut-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }
    .shortcut-name {
      font-size: 0.95rem;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .shortcut-desc {
      font-size: 0.78rem;
      line-height: 1.3;
    }
    .arrow-icon {
      font-size: 0.85rem;
      transition: transform 0.25s ease;
      align-self: center;
    }
    .shortcut-item-card:hover .arrow-icon {
      transform: translateX(3px) scale(1.1);
      color: var(--utp-primary) !important;
    }
    
    /* Background colors for shortcut icons */
    .icon-bg-orange { background: rgba(217, 119, 6, 0.08); color: #d97706; }
    .icon-bg-blue { background: rgba(2, 132, 199, 0.08); color: #0284c7; }
    .icon-bg-green { background: rgba(5, 150, 105, 0.08); color: #059669; }
    .icon-bg-purple { background: rgba(124, 58, 237, 0.08); color: #7c3aed; }
    .icon-bg-pink { background: rgba(255, 23, 68, 0.08); color: var(--utp-primary); }
    .icon-bg-slate { background: rgba(71, 85, 105, 0.08); color: #475569; }

    /* Tables */
    .table th {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom-width: 2px;
    }
    .table td {
      padding-top: 14px;
      padding-bottom: 14px;
      font-size: 0.88rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  readonly data = signal<AdminDashboardResponse | null>(null);
  readonly isLoading = signal<boolean>(true);
  currentDate = '';

  // Real System Logs signal
  readonly systemLogs = signal<any[]>([]);

  // Quick Utilities Shortcuts config
  readonly shortcuts = [
    {
      label: 'Usuarios',
      path: '/admin/usuarios',
      description: 'Gestión de roles, cuentas y perfiles estudiantiles.',
      icon: 'bi-people-fill',
      iconBg: 'icon-bg-green'
    },
    {
      label: 'Carreras',
      path: '/admin/carreras',
      description: 'Administración de facultades y carreras activas.',
      icon: 'bi-mortarboard-fill',
      iconBg: 'icon-bg-blue'
    },
    {
      label: 'Cursos',
      path: '/admin/cursos',
      description: 'Catálogo de materias y asignaturas de la UTP.',
      icon: 'bi-book-fill',
      iconBg: 'icon-bg-pink'
    },
    {
      label: 'Docentes',
      path: '/admin/docentes',
      description: 'Registro oficial de docentes y jefes de práctica.',
      icon: 'bi-person-badge-fill',
      iconBg: 'icon-bg-purple'
    },
    {
      label: 'Asignaciones',
      path: '/admin/curso-docente',
      description: 'Vincular y asignar docentes con asignaturas.',
      icon: 'bi-link-45deg',
      iconBg: 'icon-bg-orange'
    },
    {
      label: 'Criterios',
      path: '/admin/criterios',
      description: 'Configurar parámetros de valoración de encuestas.',
      icon: 'bi-patch-check-fill',
      iconBg: 'icon-bg-slate'
    }
  ];

  ngOnInit(): void {
    this.setCurrentDate();
    this.loadDashboard();
  }

  setCurrentDate(): void {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    this.currentDate = new Date().toLocaleDateString('es-ES', options);
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    
    // Load dashboard metrics
    this.adminService.getDashboard().subscribe({
      next: (res) => {
        this.data.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });

    // Load dynamic recent activity logs
    this.loadRecentActivity();
  }

  loadRecentActivity(): void {
    const logsList: any[] = [];

    // 1. Fetch pending reviews (take top 2)
    this.adminService.listarResenasPendientes().subscribe({
      next: (resenas) => {
        resenas.slice(0, 2).forEach(r => {
          logsList.push({
            time: r.fechaCreacion ? new Date(r.fechaCreacion) : new Date(),
            timeStr: r.fechaCreacion 
              ? new Date(r.fechaCreacion).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
              : 'Reciente',
            event: 'Reseña ' + (r.estado === 'PENDIENTE' ? 'Pendiente' : r.estado),
            eventClass: 'bg-warning-subtle text-warning border-warning-subtle',
            description: `Nueva reseña para el curso ${r.curso?.nombre} con el docente ${r.docente?.nombreCompleto}.`,
            status: r.estado === 'PENDIENTE' ? 'En Moderación' : r.estado,
            statusClass: r.estado === 'PENDIENTE' ? 'bg-warning' : 'bg-success'
          });
        });
        this.updateLogsSignal(logsList);
      },
      error: () => {}
    });

    // 2. Fetch pending requests (take top 2)
    this.adminService.listarSolicitudesPendientes().subscribe({
      next: (solicitudes) => {
        solicitudes.slice(0, 2).forEach(s => {
          const detail = s.tipo === 'CURSO' 
            ? `curso "${s.requestedData?.nombreCursoSugerido}"` 
            : `docente "${s.requestedData?.nombreDocenteSugerido}"`;
          logsList.push({
            time: s.fechaCreacion ? new Date(s.fechaCreacion) : new Date(),
            timeStr: s.fechaCreacion 
              ? new Date(s.fechaCreacion).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
              : 'Reciente',
            event: 'Solicitud ' + s.tipo,
            eventClass: 'bg-info-subtle text-info border-info-subtle',
            description: `Solicitud de creación de ${detail} por ${s.estudiante?.nombreCompleto}.`,
            status: s.estado === 'PENDIENTE' ? 'Pendiente' : s.estado,
            statusClass: s.estado === 'PENDIENTE' ? 'bg-warning' : 'bg-success'
          });
        });
        this.updateLogsSignal(logsList);
      },
      error: () => {}
    });

    // 3. Fetch users (take top 2)
    this.adminService.listarUsuarios().subscribe({
      next: (usuarios) => {
        const recentUsers = [...usuarios].reverse().slice(0, 2);
        recentUsers.forEach((u, i) => {
          logsList.push({
            // Mock a past date relative to current time for registered users as we don't have user registration date
            time: new Date(Date.now() - (i + 1) * 3600000), 
            timeStr: 'Reciente',
            event: 'Registro',
            eventClass: 'bg-primary-subtle text-danger border-danger-subtle',
            description: `Usuario registrado: ${u.nombres} ${u.apellidos} (${u.email}) con rol ${u.rol}.`,
            status: u.estado === 'ACTIVO' ? 'Activo' : u.estado,
            statusClass: u.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'
          });
        });
        this.updateLogsSignal(logsList);
      },
      error: () => {}
    });
  }

  private updateLogsSignal(logs: any[]): void {
    // Sort logs by date descending
    const sorted = [...logs].sort((a, b) => b.time.getTime() - a.time.getTime());
    this.systemLogs.set(sorted);
  }
}
