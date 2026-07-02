import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

interface SidebarLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Mobile Header -->
      <header class="mobile-header d-lg-none">
        <button class="menu-toggle" (click)="toggleSidebar()">
          <i class="bi" [class.bi-list]="!isSidebarOpen()" [class.bi-x]="isSidebarOpen()"></i>
        </button>
        <span class="brand-title">UTP+Recommends</span>
        <div class="user-avatar" (click)="toggleUserMenu()">
          <i class="bi bi-person-circle"></i>
        </div>
      </header>

      <!-- Sidebar -->
      <aside class="app-sidebar" [class.open]="isSidebarOpen()">
        <div class="sidebar-brand">
          <i class="bi bi-star-fill text-gold me-2"></i>
          <span>UTP+Recommends</span>
        </div>

        <div class="user-profile-summary">
          <div class="avatar-large">
            <i class="bi bi-person-fill"></i>
          </div>
          <div class="profile-info">
            <div class="user-name">{{ authService.currentUser()?.nombres }} {{ authService.currentUser()?.apellidos }}</div>
            <div class="user-role-badge" [class.admin]="authService.userRole() === 'ADMIN'">
              {{ authService.userRole() === 'ADMIN' ? 'Administrador' : 'Estudiante' }}
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          @for (link of navLinks; track link.path) {
            <a 
              [routerLink]="link.path" 
              routerLinkActive="active" 
              class="nav-link-item"
              (click)="closeSidebarOnMobile()"
            >
              <i class="bi" [class]="link.icon"></i>
              <span>{{ link.label }}</span>
            </a>
          }
          <div class="nav-divider"></div>
          <a routerLink="/public/inicio" class="nav-link-item" (click)="closeSidebarOnMobile()">
            <i class="bi bi-search"></i>
            <span>Buscador Público</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="onLogout()">
            <i class="bi bi-box-arrow-left"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Main Layout -->
      <div class="main-layout" (click)="closeSidebarOnOverlayClick()">
        <!-- Desktop Header -->
        <header class="desktop-header d-none d-lg-flex">
          <div class="header-breadcrumbs">
            <span class="active-breadcrumb">{{ pageTitle() }}</span>
          </div>

          <div class="header-user-menu">
            @if (authService.userRole() === 'ESTUDIANTE') {
              <a routerLink="/estudiante/perfil" class="profile-link-btn me-3">
                <i class="bi bi-person-gear me-2"></i>Mi Perfil
              </a>
            }
            <div class="header-user-info">
              <span class="name">{{ authService.currentUser()?.nombres }}</span>
              <span class="role">{{ authService.currentUser()?.email }}</span>
            </div>
            <button class="icon-logout-btn" (click)="onLogout()" title="Cerrar Sesión">
              <i class="bi bi-power"></i>
            </button>
          </div>
        </header>

        <!-- Main Content -->
        <main class="content-container">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
      width: 100vw;
    }

    /* Sidebar styles */
    .app-sidebar {
      width: 280px;
      background: rgba(11, 19, 41, 0.95);
      backdrop-filter: blur(20px);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1040;
      transition: transform 0.3s ease;
    }

    .sidebar-brand {
      padding: 24px;
      font-size: 1.3rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      color: #fff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .user-profile-summary {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .avatar-large {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #818cf8;
    }

    .profile-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.95rem;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 160px;
    }

    .user-role-badge {
      display: inline-block;
      align-self: flex-start;
      margin-top: 4px;
      padding: 2px 8px;
      font-size: 0.7rem;
      font-weight: 600;
      border-radius: 20px;
      background: rgba(79, 70, 229, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(79, 70, 229, 0.3);
    }

    .user-role-badge.admin {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .sidebar-nav {
      flex-grow: 1;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
    }

    .nav-link-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #94a3b8;
      text-decoration: none;
      border-radius: 10px;
      font-weight: 500;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    }

    .nav-link-item i {
      font-size: 1.2rem;
    }

    .nav-link-item:hover {
      background: rgba(255, 255, 255, 0.03);
      color: #fff;
    }

    .nav-link-item.active {
      background: rgba(79, 70, 229, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(79, 70, 229, 0.2);
    }

    .nav-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.05);
      margin: 12px 0;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .logout-btn {
      width: 100%;
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 10px;
      padding: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #fff;
    }

    /* Main Layout */
    .main-layout {
      flex-grow: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s ease;
    }

    /* Header styles */
    .desktop-header {
      height: 72px;
      background: rgba(11, 19, 41, 0.6);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding: 0 32px;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .active-breadcrumb {
      font-weight: 600;
      font-size: 1.15rem;
      color: #fff;
    }

    .header-user-menu {
      display: flex;
      align-items: center;
    }

    .profile-link-btn {
      color: #a5b4fc;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 8px;
      background: rgba(79, 70, 229, 0.1);
      border: 1px solid rgba(79, 70, 229, 0.2);
      transition: all 0.2s ease;
    }

    .profile-link-btn:hover {
      background: rgba(79, 70, 229, 0.2);
      color: #fff;
    }

    .header-user-info {
      display: flex;
      flex-direction: column;
      text-align: right;
      margin-right: 16px;
    }

    .header-user-info .name {
      font-weight: 500;
      font-size: 0.9rem;
      color: #fff;
    }

    .header-user-info .role {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }

    .icon-logout-btn {
      background: none;
      border: none;
      color: var(--text-secondary);
      font-size: 1.4rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .icon-logout-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    /* Content Container */
    .content-container {
      padding: 32px;
      flex-grow: 1;
    }

    /* Responsive styling */
    .mobile-header {
      height: 64px;
      background: rgba(11, 19, 41, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      z-index: 1050;
    }

    .menu-toggle {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .brand-title {
      font-weight: 700;
      font-size: 1.1rem;
      color: #fff;
    }

    .user-avatar {
      font-size: 1.5rem;
      color: #a5b4fc;
      cursor: pointer;
    }

    @media (max-width: 991.98px) {
      .app-sidebar {
        transform: translateX(-100%);
      }
      .app-sidebar.open {
        transform: translateX(0);
      }
      .main-layout {
        margin-left: 0;
        padding-top: 64px;
      }
      .content-container {
        padding: 20px 16px;
      }
    }
  `]
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
