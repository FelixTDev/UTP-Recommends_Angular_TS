import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface SidebarLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  readonly authService = inject(AuthService);

  readonly isSidebarOpen = signal<boolean>(false);
  readonly isUserMenuOpen = signal<boolean>(false);

  // Auto-detect links based on role
  get navLinks(): SidebarLink[] {
    const role = this.authService.userRole();
    if (role === 'ADMIN') {
      return [
        { path: '/admin/inicio', label: 'Inicio / Métricas', icon: 'bi-speedometer2' },
        { path: '/admin/usuarios', label: 'Usuarios', icon: 'bi-people' },
        { path: '/admin/carreras', label: 'Carreras', icon: 'bi-mortarboard' },
        { path: '/admin/cursos', label: 'Cursos', icon: 'bi-book' },
        { path: '/admin/docentes', label: 'Docentes', icon: 'bi-person-badge' },
        { path: '/admin/curso-docente', label: 'Asignaciones', icon: 'bi-link-45deg' },
        { path: '/admin/criterios', label: 'Criterios', icon: 'bi-patch-check' },
        { path: '/admin/moderacion/resenas', label: 'Cola Reseñas', icon: 'bi-chat-left-text' },
        { path: '/admin/moderacion/solicitudes', label: 'Cola Solicitudes', icon: 'bi-file-earmark-plus' }
      ];
    } else {
      return [
        { path: '/estudiante/inicio', label: 'Mi Panel', icon: 'bi-grid' },
        { path: '/estudiante/resenas/mis-resenas', label: 'Mis Reseñas', icon: 'bi-chat-quote' },
        { path: '/estudiante/resenas/nueva', label: 'Escribir Reseña', icon: 'bi-pencil-square' },
        { path: '/estudiante/solicitudes/mis-solicitudes', label: 'Mis Solicitudes', icon: 'bi-envelope' },
        { path: '/estudiante/solicitudes/nueva', label: 'Enviar Solicitud', icon: 'bi-send' }
      ];
    }
  }

  // Dynamic Page Title
  pageTitle(): string {
    const currentUrl = window.location.pathname;
    if (currentUrl === '/estudiante/perfil') {
      return 'Ajustes de Usuario';
    }
    const currentLink = this.navLinks.find(l => currentUrl.startsWith(l.path));
    return currentLink ? currentLink.label : 'UTP+Recommends';
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(val => !val);
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 992) {
      this.isSidebarOpen.set(false);
    }
  }

  closeSidebarOnOverlayClick(): void {
    if (window.innerWidth < 992 && this.isSidebarOpen()) {
      this.isSidebarOpen.set(false);
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(val => !val);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
