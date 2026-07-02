import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // Public Route
  {
    path: 'public/inicio',
    loadComponent: () => import('./features/public/inicio/inicio.component').then(m => m.InicioComponent)
  },

  // Auth Routes
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/registro',
    loadComponent: () => import('./features/auth/registro/registro.component').then(m => m.RegistroComponent)
  },

  // Student Routes (Protected by AuthGuard and RoleGuard)
  {
    path: 'estudiante',
    loadComponent: () => import('./layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ESTUDIANTE' },
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./features/student/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/student/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'resenas/nueva',
        loadComponent: () => import('./features/student/nueva-resena/nueva-resena.component').then(m => m.NuevaResenaComponent)
      },
      {
        path: 'resenas/mis-resenas',
        loadComponent: () => import('./features/student/mis-resenas/mis-resenas.component').then(m => m.MisResenasComponent)
      },
      {
        path: 'solicitudes/nueva',
        loadComponent: () => import('./features/student/nueva-solicitud/nueva-solicitud.component').then(m => m.NuevaSolicitudComponent)
      },
      {
        path: 'solicitudes/mis-solicitudes',
        loadComponent: () => import('./features/student/mis-solicitudes/mis-solicitudes.component').then(m => m.MisSolicitudesComponent)
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ]
  },

  // Admin Routes (Protected by AuthGuard and RoleGuard)
  {
    path: 'admin',
    loadComponent: () => import('./layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'ADMIN' },
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'carreras',
        loadComponent: () => import('./features/admin/carreras/carreras.component').then(m => m.CarrerasComponent)
      },
      {
        path: 'cursos',
        loadComponent: () => import('./features/admin/cursos/cursos.component').then(m => m.CursosComponent)
      },
      {
        path: 'docentes',
        loadComponent: () => import('./features/admin/docentes/docentes.component').then(m => m.DocentesComponent)
      },
      {
        path: 'curso-docente',
        loadComponent: () => import('./features/admin/curso-docente/curso-docente.component').then(m => m.CursoDocenteComponent)
      },
      {
        path: 'criterios',
        loadComponent: () => import('./features/admin/criterios/criterios.component').then(m => m.CriteriosComponent)
      },
      {
        path: 'moderacion/resenas',
        loadComponent: () => import('./features/admin/moderacion-resenas/moderacion-resenas.component').then(m => m.ModeracionResenasComponent)
      },
      {
        path: 'moderacion/solicitudes',
        loadComponent: () => import('./features/admin/moderacion-solicitudes/moderacion-solicitudes.component').then(m => m.ModeracionSolicitudesComponent)
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      }
    ]
  },

  // Fallbacks
  {
    path: '',
    redirectTo: 'public/inicio',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'public/inicio'
  }
];
