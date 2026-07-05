import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PublicService } from '../../../core/services/public.service';
import { AuthService } from '../../../core/auth/auth.service';
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
  template: `
    <div class="public-landing">
      <!-- Background Blobs -->
      <div class="auth-bg-blobs" style="opacity: 0.04;">
        <div class="auth-blob auth-blob-1"></div>
        <div class="auth-blob auth-blob-2"></div>
        <div class="auth-blob auth-blob-3"></div>
      </div>

      <!-- Navbar overlay -->
      <nav class="public-nav">
        <div class="container d-flex justify-content-between align-items-center">
          <div class="brand">
            <span class="logo-box">U</span>
            <span class="logo-box">T</span>
            <span class="logo-box">P</span>
            <span class="logo-plus">+</span>
            <span class="logo-text">Recommends</span>
          </div>
          <div class="actions">
            @if (authService.isAuthenticated()) {
              <a [routerLink]="dashboardRoute()" class="btn-primary-glass py-2 text-decoration-none">
                <i class="bi bi-grid me-2"></i>Mi Panel
              </a>
            } @else {
              <a routerLink="/auth/login" class="btn-secondary-glass me-2 py-2 text-decoration-none">Ingresar</a>
              <a routerLink="/auth/registro" class="btn-primary-glass py-2 text-decoration-none">Registrarse</a>
            }
          </div>
        </div>
      </nav>

      <!-- Hero Header (Split Screen) -->
      <header class="hero-section">
        <div class="container">
          <div class="row align-items-center g-5">
            <!-- Hero Text & Search Filters -->
            <div class="col-lg-7 text-start">
              <h1 class="display-5 fw-bold mb-3 text-dark-title">Encuentra y comparte <span class="text-gradient">opiniones reales</span></h1>
              <p class="lead text-muted-custom mb-4">
                Plataforma oficial de recomendaciones de cursos y docentes de la UTP. Toma mejores decisiones para tu matrícula basándote en la experiencia de tus compañeros.
              </p>

              <!-- Search Filter Bar -->
              <div class="filter-bar text-start mx-0">
                <div class="row g-3">
                  <div class="col-md-5">
                    <label class="glass-form-label"><i class="bi bi-search me-1"></i> Buscar docente o curso</label>
                    <input 
                      type="text" 
                      class="glass-input" 
                      placeholder="Ej: Análisis de Algoritmos, Carlos Pérez..."
                      [(ngModel)]="searchText"
                      (ngModelChange)="onFilterChange()"
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="glass-form-label"><i class="bi bi-mortarboard me-1"></i> Carrera (Filtro)</label>
                    <select 
                      class="glass-input" 
                      [(ngModel)]="selectedCarrera"
                      (ngModelChange)="onFilterChange()"
                    >
                      <option [value]="0">Todas las carreras</option>
                      @for (carrera of carreras(); track carrera.id) {
                        <option [value]="carrera.id">{{ carrera.nombre }}</option>
                      }
                    </select>
                  </div>
                  <div class="col-md-3 d-flex align-items-end">
                    <button class="btn-secondary-glass w-100 py-2.5" (click)="resetFilters()">
                      <i class="bi bi-arrow-counterclockwise me-2"></i>Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hero Carousel (Right Side) -->
            <div class="col-lg-5 col-12">
              <div class="premium-carousel">
                <div class="carousel-track">
                  @for (slide of slides; track slide.image; let idx = $index) {
                    <div 
                      class="carousel-slide" 
                      [class.active]="activeSlide() === idx"
                    >
                      <div class="slide-image-container">
                        <img [src]="slide.image" [alt]="slide.title" class="slide-img" />
                        <div class="slide-overlay"></div>
                      </div>
                      <div class="slide-caption">
                        <h4 class="slide-title">{{ slide.title }}</h4>
                        <p class="slide-desc">{{ slide.description }}</p>
                      </div>
                    </div>
                  }
                </div>
                <!-- Controls and Dots -->
                <button class="carousel-btn prev" (click)="prevSlide()" aria-label="Anterior">
                  <i class="bi bi-chevron-left"></i>
                </button>
                <button class="carousel-btn next" (click)="nextSlide()" aria-label="Siguiente">
                  <i class="bi bi-chevron-right"></i>
                </button>
                <div class="carousel-dots">
                  @for (slide of slides; track slide.image; let idx = $index) {
                    <button 
                      class="carousel-dot" 
                      [class.active]="activeSlide() === idx"
                      (click)="setSlide(idx)"
                      [attr.aria-label]="'Ir al slide ' + (idx + 1)"
                    ></button>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Stats Section -->
      <section class="stats-section container mb-5">
        <div class="stats-container">
          <div class="row text-center g-4">
            <div class="col-md-4">
              <div class="stat-card">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-chat-heart-fill"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">+1,500</h3>
                  <p class="stat-label">Opiniones Reales</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-card">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-person-video3"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">+350</h3>
                  <p class="stat-label">Docentes Evaluados</p>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-card">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
                <div class="stat-content">
                  <h3 class="stat-number">4.8 / 5</h3>
                  <p class="stat-label">Calificación Promedio</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Body -->
      <section class="reviews-section container py-4">


        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
          <h2 class="h3 fw-bold mb-0 text-dark" style="color: #0f172a;">Reseñas Recientes</h2>
          <span class="badge bg-light text-dark border px-3 py-2 rounded-pill font-monospace" style="font-size: 0.85rem;">
            {{ filteredReviews.length }} reseña(s) encontrada(s)
          </span>
        </div>

        @if (isLoading()) {
          <app-loading-skeleton type="card" [count]="3"></app-loading-skeleton>
        } @else if (filteredReviews.length === 0) {
          <app-empty-state 
            icon="bi-chat-left-dots-fill"
            title="Sin Reseñas Aprobadas" 
            description="Aún no hay reseñas registradas o ninguna coincide con tus filtros."
            [actionText]="authService.isAuthenticated() ? 'Escribir Reseña' : 'Iniciar Sesión para Escribir'"
            (action)="onEmptyStateAction()"
          ></app-empty-state>
        } @else {
          <div class="row g-4">
            @for (resena of filteredReviews; track resena.id; let idx = $index) {
              <div class="col-md-6 col-lg-4 fade-in-up" [style.animation-delay]="(idx % 3) * 0.15 + 's'">
                <div class="review-card" [ngClass]="getCardScoreClass(resena)">
                  <div class="card-header-custom d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h3 class="h5 fw-bold mb-1 text-dark" style="color: #0f172a;">{{ resena.docente }}</h3>
                      <span class="badge-badge badge-primary">{{ resena.curso }}</span>
                    </div>
                    <div class="average-stars">
                      <app-star-rating [value]="calculateAverage(resena)" [readOnly]="true"></app-star-rating>
                    </div>
                  </div>
                  
                  <p class="comment-text text-muted-custom mb-3">
                    <i class="bi bi-quote text-gold fs-4 me-1 d-inline-block" style="transform: rotate(180deg) translateY(-2px);"></i>
                    {{ resena.comentario }}
                  </p>

                  <!-- Criteria breakdown -->
                  <div class="criteria-list mb-3">
                    @for (cal of resena.calificaciones; track cal.criterio) {
                      <div class="criteria-item d-flex justify-content-between align-items-center mb-1.5">
                        <span class="criteria-name">{{ cal.criterio }}</span>
                        <div class="criteria-stars">
                          <span class="score-num me-2 text-gold font-monospace fw-bold">{{ cal.puntaje }}</span>
                          <i class="bi bi-star-fill text-gold small"></i>
                        </div>
                      </div>
                    }
                  </div>

                  <div class="card-footer-custom d-flex justify-content-between align-items-center pt-3 mt-auto">
                    <span class="student-name">
                      @if (!resena.esAnonimo) {
                        <i class="bi bi-patch-check-fill text-success me-1.5" title="Estudiante UTP Verificado"></i>
                      } @else {
                        <i class="bi bi-person-circle text-gold me-1.5"></i>
                      }
                      {{ resena.esAnonimo ? 'Estudiante Anónimo' : resena.nombreEstudianteVisible }}
                    </span>
                    <span class="review-date">
                      <i class="bi bi-calendar3 me-1.5"></i>
                      {{ resena.fechaCreacion | date:'dd/MM/yyyy' }}
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Pagination Bar -->
          @if (totalPages() > 1) {
            <div class="pagination-container d-flex justify-content-center mt-5">
              <button 
                class="btn-secondary-glass py-2 px-3 me-2" 
                [disabled]="currentPage() === 0"
                (click)="changePage(currentPage() - 1)"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <span class="align-self-center mx-3 text-muted-custom">
                Pág. <strong>{{ currentPage() + 1 }}</strong> de {{ totalPages() }}
              </span>
              <button 
                class="btn-secondary-glass py-2 px-3" 
                [disabled]="currentPage() >= totalPages() - 1"
                (click)="changePage(currentPage() + 1)"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          }
        }
      </section>

      <!-- Footer Section -->
      <footer class="premium-footer">
        <div class="container">
          <div class="row g-4 justify-content-between">
            <!-- Columna 1: Sedes -->
            <div class="col-lg-4 col-md-12">
              <h4 class="footer-title">Nuestros Campus</h4>
              <div class="campus-grid">
                @for (campus of campuses; track campus) {
                  <span class="campus-badge">{{ campus }}</span>
                }
              </div>
              <div class="footer-actions mt-4 d-flex flex-wrap gap-2">
                <a href="https://www.utp.edu.pe/admision" target="_blank" class="btn-footer-outline">
                  <i class="bi bi-mortarboard me-2"></i>Admisión 2026
                </a>
                <a href="https://www.utp.edu.pe/trabaja-en-utp" target="_blank" class="btn-footer-outline">
                  <i class="bi bi-briefcase me-2"></i>Trabaja en UTP
                </a>
              </div>
            </div>

            <!-- Columna 2: Contacto -->
            <div class="col-lg-4 col-md-6">
              <h4 class="footer-title">Canales de Atención</h4>
              <div class="contact-block mb-3">
                <h5 class="contact-subtitle"><i class="bi bi-telephone-fill text-danger me-2"></i>Postulantes</h5>
                <p class="contact-text">Lima: <strong>(01) 315 9610</strong> | Provincia: <strong>0800 71 900</strong></p>
                <p class="contact-text">WhatsApp: <a href="https://bit.ly/ConversaUTP_WA" target="_blank" class="footer-link">Conversa aquí</a></p>
                <p class="contact-text">Correo: <a href="mailto:admision@utp.edu.pe" class="footer-link">admision&#64;utp.edu.pe</a></p>
                <p class="contact-meta">Lun - Sab: 8:30 a.m. a 8:00 p.m.</p>
              </div>
              <div class="contact-block">
                <h5 class="contact-subtitle"><i class="bi bi-shield-fill-check text-danger me-2"></i>Alumnos (SAE)</h5>
                <p class="contact-text">Lima: <strong>(01) 315 9600</strong> | Provincia: <strong>0801 19 600</strong></p>
                <p class="contact-text">WhatsApp: <a href="https://bit.ly/contacto_SAE" target="_blank" class="footer-link">Contacto SAE</a></p>
                <p class="contact-meta">Lun - Vie: 7:00 a.m. a 10:00 p.m. | Sáb - Dom: 7:00 a.m. a 8:00 p.m.</p>
              </div>
            </div>

            <!-- Columna 3: Enlaces y Redes -->
            <div class="col-lg-3 col-md-6 d-flex flex-column justify-content-between">
              <div>
                <h4 class="footer-title">Síguenos</h4>
                <div class="social-links d-flex gap-2 mb-4">
                  <a href="https://www.facebook.com/UTP.Peru" target="_blank" class="social-btn facebook" aria-label="Facebook">
                    <i class="bi bi-facebook"></i>
                  </a>
                  <a href="https://www.youtube.com/user/UTPOficial" target="_blank" class="social-btn youtube" aria-label="YouTube">
                    <i class="bi bi-youtube"></i>
                  </a>
                  <a href="https://www.linkedin.com/school/universidad-tecnologica-del-peru/" target="_blank" class="social-btn linkedin" aria-label="LinkedIn">
                    <i class="bi bi-linkedin"></i>
                  </a>
                  <a href="https://www.instagram.com/utp.peru/" target="_blank" class="social-btn instagram" aria-label="Instagram">
                    <i class="bi bi-instagram"></i>
                  </a>
                </div>

                <h4 class="footer-title">Institucional</h4>
                <ul class="footer-links list-unstyled">
                  <li><a href="https://www.utp.edu.pe/politicas-de-privacidad" target="_blank">Políticas de privacidad</a></li>
                  <li><a href="https://www.utp.edu.pe/transparencia" target="_blank">Portal de transparencia</a></li>
                  <li><a href="https://www.utp.edu.pe/terminos-y-condiciones" target="_blank">Términos y condiciones</a></li>
                  <li><a href="https://www.utp.edu.pe/mapa-del-sitio" target="_blank">Mapa del sitio</a></li>
                </ul>
              </div>

              <div class="reclamaciones-block mt-3">
                <a href="https://librodereclamaciones.utp.edu.pe/" target="_blank" class="reclamaciones-btn">
                  <span>Libro de Reclamaciones</span>
                </a>
              </div>
            </div>
          </div>

          <hr class="footer-divider" />

          <div class="footer-bottom">
            <span class="copyright">Universidad Tecnológica del Perú | UTP S.A.C. RUC: 20462509236. Todos los derechos reservados.</span>
            <button class="back-to-top-btn" (click)="scrollToTop()" title="Volver arriba">
              <i class="bi bi-arrow-up-short"></i>
            </button>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .public-landing {
      min-height: 100vh;
      position: relative;
      background: var(--bg-gradient);
      overflow-x: hidden;
    }
    .public-nav {
      height: 72px;
      border-bottom: 1px solid rgba(255, 23, 68, 0.08) !important;
      background: rgba(255, 255, 255, 0.8) !important;
      backdrop-filter: blur(20px) !important;
      -webkit-backdrop-filter: blur(20px) !important;
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 1000;
      transition: all 0.3s ease;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.01);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .logo-box {
      background: #000000;
      color: #ffffff;
      font-weight: 900;
      font-size: 1.3rem;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      line-height: 1;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .logo-plus {
      color: #FF1744;
      font-weight: 900;
      font-size: 1.8rem;
      margin: 0 5px;
      line-height: 1;
      animation: pulseGlow 3s infinite ease-in-out;
      display: inline-block;
    }
    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px var(--utp-primary)); }
      50% { transform: scale(1.15); filter: drop-shadow(0 0 4px var(--utp-primary)); }
    }
    .logo-text {
      color: #000000;
      font-weight: 800;
      font-size: 1.7rem;
      letter-spacing: -0.5px;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .btn-primary-glass, .btn-secondary-glass {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .btn-primary-glass:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 20px rgba(255, 23, 68, 0.2);
    }
    .btn-secondary-glass:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
    }
    .hero-section {
      padding: 70px 0 50px;
      position: relative;
      z-index: 5;
    }
    .text-dark-title {
      color: #0f172a !important;
    }
    .filter-bar {
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(255, 23, 68, 0.08);
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.04);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .filter-bar .glass-input {
      background: rgba(15, 23, 42, 0.02);
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 10px;
      color: #0f172a;
      transition: all 0.3s ease;
    }
    .filter-bar .glass-input:focus {
      border-color: var(--utp-primary);
      box-shadow: 0 0 0 4px rgba(255, 23, 68, 0.1);
      background: #ffffff;
    }
    
    /* Carousel Styles */
    .premium-carousel {
      position: relative;
      width: 100%;
      height: 360px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.5);
      background: #000;
    }
    .carousel-track {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .carousel-slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.8s ease-in-out, visibility 0.8s ease-in-out;
      z-index: 1;
    }
    .carousel-slide.active {
      opacity: 1;
      visibility: visible;
      z-index: 2;
    }
    .slide-image-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .slide-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 6s ease;
    }
    .carousel-slide.active .slide-img {
      transform: scale(1.08);
    }
    .slide-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(15, 23, 42, 0.1) 100%);
    }
    .slide-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 24px 28px;
      color: #ffffff;
      z-index: 3;
      transform: translateY(15px);
      opacity: 0;
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.15s;
    }
    .carousel-slide.active .slide-caption {
      transform: translateY(0);
      opacity: 1;
    }
    .slide-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin-bottom: 6px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      color: #ffffff;
    }
    .slide-desc {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.85);
      margin-bottom: 0;
      line-height: 1.4;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      z-index: 10;
      opacity: 0;
    }
    .premium-carousel:hover .carousel-btn {
      opacity: 1;
    }
    .carousel-btn:hover {
      background: rgba(255, 17, 68, 0.9);
      border-color: rgba(255, 17, 68, 0.9);
      box-shadow: 0 4px 12px rgba(255, 17, 68, 0.3);
    }
    .carousel-btn.prev { left: 16px; }
    .carousel-btn.next { right: 16px; }
    .carousel-dots {
      position: absolute;
      bottom: 20px;
      right: 24px;
      display: flex;
      gap: 6px;
      z-index: 10;
    }
    .carousel-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      border: none;
      padding: 0;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .carousel-dot.active {
      background: var(--utp-primary);
      width: 20px;
      border-radius: 4px;
      box-shadow: 0 0 8px var(--utp-primary);
    }

    /* Stats Section Styles */
    .stats-section {
      position: relative;
      z-index: 5;
    }
    .stats-container {
      background: rgba(255, 255, 255, 0.75);
      border: 1px solid rgba(15, 23, 42, 0.05);
      border-radius: 20px;
      padding: 24px 30px;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.015);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .stat-card {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      text-align: left;
    }
    .stat-icon-wrapper {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      background: rgba(255, 23, 68, 0.08);
      color: var(--utp-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      border: 1px solid rgba(255, 23, 68, 0.1);
    }
    .stat-number {
      font-size: 1.6rem;
      font-weight: 800;
      margin-bottom: 0px;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .stat-label {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--utp-text-secondary);
      margin-bottom: 0;
    }

    /* Quick Filters Section Styles */


    .reviews-section {
      position: relative;
      z-index: 5;
    }
    .review-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(15, 23, 42, 0.05);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.02);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .review-card:hover {
      transform: translateY(-4px);
      border-color: rgba(255, 23, 68, 0.18);
      box-shadow: 0 20px 35px rgba(15, 23, 42, 0.05);
    }
    
    /* Rating colors for cards */
    .review-card.score-excellent {
      border-left: 5px solid var(--utp-success) !important;
    }
    .review-card.score-good {
      border-left: 5px solid var(--utp-info) !important;
    }
    .review-card.score-regular {
      border-left: 5px solid var(--utp-warning) !important;
    }

    .comment-text {
      font-style: italic;
      line-height: 1.65;
      flex-grow: 1;
      color: #334155;
      font-size: 0.92rem;
      position: relative;
    }
    .criteria-list {
      background: rgba(15, 23, 42, 0.015);
      border-radius: 10px;
      padding: 14px;
      border: 1px solid rgba(15, 23, 42, 0.03);
    }
    .criteria-name {
      font-size: 0.8rem;
      font-weight: 500;
      color: #64748b;
    }
    .score-num {
      font-size: 0.85rem;
    }
    .card-footer-custom {
      border-top: 1px solid rgba(15, 23, 42, 0.05);
    }
    .student-name {
      font-size: 0.8rem;
      font-weight: 500;
      color: #475569;
    }
    .review-date {
      font-size: 0.78rem;
      color: #64748b;
    }
    .text-gradient {
      background: linear-gradient(135deg, var(--utp-primary) 30%, #99001d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Premium Footer Styles */
    .premium-footer {
      background: #000000;
      color: #94a3b8;
      padding: 70px 0 35px;
      margin-top: 80px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      position: relative;
      z-index: 10;
    }
    .footer-title {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 20px;
      position: relative;
      padding-bottom: 6px;
    }
    .footer-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 25px;
      height: 2px;
      background: var(--utp-primary);
    }
    .campus-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 6px;
    }
    .campus-badge {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #94a3b8;
      font-size: 0.72rem;
      padding: 4px 6px;
      border-radius: 5px;
      text-align: center;
      transition: all 0.25s ease;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .campus-badge:hover {
      background: rgba(255, 23, 68, 0.1);
      border-color: rgba(255, 23, 68, 0.3);
      color: #ffffff;
    }
    .btn-footer-outline {
      flex: 1;
      min-width: 120px;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 6px;
      text-align: center;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .btn-footer-outline:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: #ffffff;
    }
    .contact-block {
      background: rgba(255, 255, 255, 0.015);
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 10px;
      padding: 12px 14px;
    }
    .contact-subtitle {
      font-size: 0.82rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
    }
    .contact-text {
      font-size: 0.78rem;
      margin-bottom: 4px;
      color: #94a3b8;
    }
    .contact-text strong {
      color: #ffffff;
    }
    .contact-meta {
      font-size: 0.72rem;
      color: #64748b;
      margin-bottom: 0;
      font-style: italic;
    }
    .footer-link {
      color: var(--utp-primary);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .footer-link:hover {
      color: #ffffff;
      text-decoration: underline;
    }
    .social-links .social-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .social-links .social-btn:hover {
      color: #ffffff;
      transform: translateY(-2px);
    }
    .social-links .social-btn.facebook:hover { background: #3b5998; border-color: #3b5998; }
    .social-links .social-btn.youtube:hover { background: #ff0000; border-color: #ff0000; }
    .social-links .social-btn.linkedin:hover { background: #0077b5; border-color: #0077b5; }
    .social-links .social-btn.instagram:hover { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); border-color: transparent; }
    
    .footer-links li {
      margin-bottom: 8px;
    }
    .footer-links a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }
    .footer-links a:hover {
      color: var(--utp-primary);
      padding-left: 3px;
    }
    .reclamaciones-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 23, 68, 0.06);
      border: 1px solid rgba(255, 23, 68, 0.18);
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 10px 16px;
      border-radius: 6px;
      text-decoration: none;
      transition: all 0.3s ease;
      width: 100%;
    }
    .reclamaciones-btn:hover {
      background: var(--utp-primary);
      border-color: var(--utp-primary);
      box-shadow: 0 4px 12px rgba(255, 23, 68, 0.25);
    }
    .footer-divider {
      margin: 30px 0 18px;
      border-color: rgba(255, 255, 255, 0.06);
    }
    .footer-bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      gap: 15px;
    }
    .copyright {
      font-size: 0.74rem;
      color: #64748b;
      text-align: center;
    }
    .back-to-top-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff;
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 0;
    }
    .back-to-top-btn:hover {
      background: var(--utp-primary);
      border-color: var(--utp-primary);
      box-shadow: 0 4px 10px rgba(255, 23, 68, 0.25);
      transform: translateY(-2px);
    }
    @media (min-width: 768px) {
      .footer-bottom {
        flex-direction: row;
      }
      .back-to-top-btn {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  `]
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
