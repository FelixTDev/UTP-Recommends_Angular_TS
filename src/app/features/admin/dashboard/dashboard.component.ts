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
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
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
