import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ModeracionResenaResponse } from '../../../core/models/admin.models';
import { UiService } from '../../../core/services/ui.service';
import { StatusBadgePipe } from '../../../shared/pipes/status-badge.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from '../../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-moderacion-resenas',
  standalone: true,
  imports: [
    CommonModule,
    StatusBadgePipe,
    EmptyStateComponent,
    LoadingSkeletonComponent,
    FormsModule
  ],
  template: `
    <div class="moderacion-resenas">
      <!-- Header Row -->
      <div class="row mb-4 align-items-center">
        <div class="col-md-6 text-start">
          <h1 class="h2 fw-bold text-dark-title">Moderación de Reseñas</h1>
          <p class="text-muted-custom">Aprueba, rechaza u oculta reseñas académicas estudiantiles en el sistema.</p>
        </div>
      </div>

      <!-- Unified Filters Bar -->
      <div class="glass-card mb-4 p-3 search-filter-bar">
        <div class="row g-3 align-items-center">
          <!-- Text Search input -->
          <div class="col-md-8">
            <div class="search-input-group">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                class="form-control filter-search-input" 
                placeholder="Buscar por curso, docente o texto del comentario..."
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
              />
              @if (searchTerm()) {
                <button class="btn-clear-search" (click)="searchTerm.set('')">
                  <i class="bi bi-x-circle-fill"></i>
                </button>
              }
            </div>
          </div>
          
          <!-- Status Filter -->
          <div class="col-md-4">
            <div class="d-flex align-items-center select-filter-container">
              <i class="bi bi-funnel-fill filter-icon text-muted"></i>
              <select class="form-select filter-select" [(ngModel)]="filterEstado" (change)="loadQueue()">
                <option value="PENDIENTE">Pendientes únicamente</option>
                <option value="APROBADA">Aprobadas</option>
                <option value="RECHAZADA">Rechazadas</option>
                <option value="OCULTA">Ocultas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      @if (isLoading()) {
        <app-loading-skeleton type="list" [count]="3"></app-loading-skeleton>
      } @else if (filteredQueue().length === 0) {
        <app-empty-state 
          icon="bi-check2-all"
          title="Cola de Moderación Vacía" 
          description="No se encontraron reseñas registradas bajo esta búsqueda o filtro."
        ></app-empty-state>
      } @else {
        <div class="row g-4">
          @for (res of filteredQueue(); track res.idResena) {
            <div class="col-12">
              <!-- Review Card -->
              <div class="moderation-card glass-card text-start">
                
                <!-- Review Card Header -->
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 border-bottom pb-3">
                  <div class="d-flex flex-wrap align-items-center gap-2">
                    <span class="badge-role student-role">ID Reseña: #{{ res.idResena }}</span>
                    @let status = (res.estado | statusBadge);
                    <span class="badge-status" [ngClass]="'badge-status-' + res.estado.toLowerCase()">
                      <span class="status-indicator"></span>
                      {{ status.label }}
                    </span>
                    <span class="text-muted-custom small ms-md-2">
                      <i class="bi bi-calendar3 me-2"></i>{{ res.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}
                    </span>
                  </div>
                  
                  <div class="student-info-tag small text-muted-custom bg-light-subtle px-3 py-2 rounded-pill border border-light-subtle">
                    <i class="bi bi-person-fill me-2 text-primary-color"></i>
                    Estudiante: <strong class="text-dark-title">{{ res.esAnonimo ? 'Anónimo' : res.estudiante.nombreCompleto }}</strong> 
                    @if (!res.esAnonimo) {
                      <span class="text-muted-custom font-monospace"> ({{ res.estudiante.correo }})</span>
                    }
                  </div>
                </div>

                <!-- Review Content -->
                <div class="row g-4 align-items-stretch">
                  <!-- Main commentary text -->
                  <div class="col-md-9 d-flex flex-column justify-content-between">
                    <div>
                      <div class="d-flex align-items-center gap-2 mb-2">
                        <i class="bi bi-person-badge-fill text-gold fs-5 me-2"></i>
                        <h3 class="h5 fw-bold text-dark-title mb-0">Catedrático: {{ res.docente.nombreCompleto }}</h3>
                      </div>
                      <div class="mb-3">
                        <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-2 rounded-pill" style="font-size: 0.8rem; font-weight: 600;">
                          <i class="bi bi-book-fill me-2"></i>{{ res.curso.nombre }}
                        </span>
                      </div>

                      <div class="comment-quote p-3 rounded mb-3 bg-light border-start-warning">
                        <i class="bi bi-quote quote-icon text-muted"></i>
                        <p class="mb-0 fs-6 text-dark-title text-quote">"{{ res.comentario }}"</p>
                      </div>
                    </div>
                  </div>

                  <!-- Scores summary card -->
                  <div class="col-md-3">
                    <div class="scores-card p-3 rounded border border-light-subtle bg-light h-100 d-flex flex-column justify-content-between">
                      <div>
                        <span class="d-block small text-muted-custom mb-3 fw-bold text-uppercase tracking-wider">Criterios de Encuesta:</span>
                        @for (cal of res.calificaciones; track cal.criterioId) {
                          <div class="d-flex justify-content-between align-items-center mb-2 small">
                            <span class="text-muted-custom text-truncate pe-2" style="max-width: 140px;">{{ cal.criterio }}</span>
                            <div class="d-flex align-items-center gap-2">
                              <strong class="text-dark-title font-monospace">{{ cal.puntaje }}</strong>
                              <i class="bi bi-star-fill text-gold small"></i>
                            </div>
                          </div>
                        }
                      </div>
                      <div class="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                        <span class="small fw-bold text-dark-title text-uppercase tracking-wider">Promedio:</span>
                        <div class="d-flex align-items-center gap-2">
                          <strong class="text-gold fs-5 font-monospace">{{ calculateAverage(res) | number:'1.1-1' }}</strong>
                          <i class="bi bi-star-fill text-gold fs-5"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Controls overlay -->
                <div class="moderation-actions mt-4 pt-3 border-top d-flex flex-wrap gap-2 justify-content-end align-items-center">
                  @if (activeRejectId() === res.idResena) {
                    <!-- Reject input overlay block -->
                    <div class="w-100 d-flex flex-column gap-2 mt-2 bg-danger-subtle p-3 rounded border border-danger-subtle animate-fade">
                      <div class="text-start">
                        <label class="glass-form-label text-danger mb-2 fw-bold"><i class="bi bi-exclamation-circle-fill me-2"></i>Especificar Motivo del Rechazo (Obligatorio)</label>
                        <input 
                          type="text" 
                          class="form-control glass-input" 
                          placeholder="Indique la causa del rechazo (ej: Contiene lenguaje inapropiado, spam, etc.)"
                          [(ngModel)]="rejectReasonText"
                        />
                      </div>
                      <div class="d-flex gap-2 justify-content-end mt-1">
                        <button class="btn btn-sm btn-cancel-modal py-2 px-3" (click)="cancelReject()">Cancelar</button>
                        <button class="btn btn-sm btn-danger py-2 px-4 rounded-pill shadow-sm" [disabled]="!rejectReasonText.trim()" (click)="confirmReject(res.idResena)">
                          Confirmar Rechazo
                        </button>
                      </div>
                    </div>
                  } @else {
                    <!-- Standard action buttons -->
                    @if (res.estado === 'PENDIENTE') {
                      <button class="btn btn-outline-danger py-2 px-4 rounded-pill shadow-sm d-flex align-items-center gap-2" (click)="startReject(res.idResena)">
                        <i class="bi bi-x-circle-fill me-2"></i>Rechazar
                      </button>
                      <button class="btn btn-success py-2 px-4 rounded-pill shadow-sm d-flex align-items-center gap-2" (click)="approve(res.idResena)">
                        <i class="bi bi-check-circle-fill me-2"></i>Aprobar
                      </button>
                    }
                    @if (res.estado === 'APROBADA') {
                      <button class="btn btn-outline-danger py-2 px-4 rounded-pill shadow-sm d-flex align-items-center gap-2" (click)="hide(res.idResena)">
                        <i class="bi bi-eye-slash-fill me-2"></i>Ocultar Reseña
                      </button>
                    }
                    @if (res.estado === 'RECHAZADA' && res.motivoRechazo) {
                      <div class="w-100 text-start bg-light p-2.5 rounded border small text-muted-custom">
                        <strong>Motivo de Rechazo:</strong> "{{ res.motivoRechazo }}"
                      </div>
                    }
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .moderacion-resenas {
      color: var(--text-primary);
    }
    .text-dark-title {
      color: #0f172a !important;
    }
    
    /* Spacing for icons inside headers, badges, and buttons to prevent overlaps */
    .moderation-card h3 i, 
    .moderation-card button i, 
    .moderation-card .badge-status i,
    .moderation-card .student-info-tag i,
    .moderation-card .badge i {
      margin-right: 8px !important;
      display: inline-block;
    }
    
    /* Unified Search/Filter Bar */
    .search-filter-bar {
      border: 1px solid var(--utp-border);
      background: rgba(255, 255, 255, 0.85);
      border-radius: 18px;
    }
    .search-input-group {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 16px;
      color: #94a3b8;
      font-size: 1.05rem;
    }
    .filter-search-input {
      padding: 10px 45px;
      font-size: 0.88rem;
      border: 1px solid var(--utp-border);
      border-radius: 12px;
      background: #ffffff;
      color: #0f172a;
      transition: all 0.2s ease;
      width: 100%;
    }
    .filter-search-input:focus {
      border-color: rgba(255, 23, 68, 0.4);
      box-shadow: 0 0 0 4px rgba(255, 23, 68, 0.08);
      background: #ffffff;
    }
    .btn-clear-search {
      position: absolute;
      right: 14px;
      background: none;
      border: none;
      color: #94a3b8;
      padding: 0;
      display: flex;
      align-items: center;
      transition: color 0.2s ease;
      cursor: pointer;
    }
    .btn-clear-search:hover {
      color: var(--utp-primary);
    }
    
    .select-filter-container {
      position: relative;
      width: 100%;
    }
    .filter-icon {
      position: absolute;
      left: 14px;
      font-size: 0.9rem;
      pointer-events: none;
    }
    .filter-select {
      padding: 10px 14px 10px 38px;
      font-size: 0.88rem;
      border: 1px solid var(--utp-border);
      border-radius: 12px;
      background-color: #ffffff;
      color: #0f172a;
      cursor: pointer;
      width: 100%;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 14px center;
      background-size: 12px 10px;
    }
    .filter-select:focus {
      border-color: rgba(255, 23, 68, 0.4);
      box-shadow: 0 0 0 4px rgba(255, 23, 68, 0.08);
    }

    /* Badges status */
    .badge-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      font-size: 0.78rem;
      font-weight: 700;
      border-radius: 30px;
    }
    .badge-status-pendiente {
      background: rgba(217, 119, 6, 0.06);
      color: #d97706;
      border: 1px solid rgba(217, 119, 6, 0.12);
    }
    .badge-status-pendiente .status-indicator { background-color: #d97706; }
    
    .badge-status-aprobada {
      background: rgba(5, 150, 105, 0.06);
      color: #059669;
      border: 1px solid rgba(5, 150, 105, 0.12);
    }
    .badge-status-aprobada .status-indicator { background-color: #059669; }
    
    .badge-status-rechazada, .badge-status-oculta {
      background: rgba(220, 38, 38, 0.06);
      color: #dc2626;
      border: 1px solid rgba(220, 38, 38, 0.12);
    }
    .badge-status-rechazada .status-indicator, .badge-status-oculta .status-indicator { background-color: #dc2626; }
    
    .status-indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }

    .badge-role {
      display: inline-block;
      padding: 4px 10px;
      font-size: 0.78rem;
      font-weight: 700;
      border-radius: 30px;
    }
    .student-role {
      background: rgba(2, 132, 199, 0.06);
      color: #0284c7;
      border: 1px solid rgba(2, 132, 199, 0.12);
    }
    
    /* Card borders based on ratings */
    .moderation-card {
      transition: all 0.25s ease;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid var(--utp-border);
      border-radius: 16px;
      padding: 24px;
    }
    .moderation-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.02);
      background: #ffffff;
    }

    .comment-quote {
      border-left: 4px solid var(--utp-primary);
      line-height: 1.5;
      position: relative;
    }
    .text-quote {
      font-style: italic;
      font-size: 0.95rem;
      color: #334155 !important;
      position: relative;
      z-index: 1;
    }
    
    .scores-card {
      font-size: 0.82rem;
    }
    .tracking-wider {
      letter-spacing: 0.5px;
    }
    
    /* Form inputs inside overlay */
    .glass-form-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .glass-input {
      width: 100%;
      padding: 10px 16px;
      font-size: 0.88rem;
      border: 1px solid var(--utp-border);
      border-radius: 8px;
      background: #ffffff;
      color: #0f172a;
      transition: all 0.2s ease;
    }
    .glass-input:focus {
      border-color: rgba(255, 23, 68, 0.4);
      box-shadow: 0 0 0 4px rgba(255, 23, 68, 0.08);
      outline: none;
    }
    .btn-cancel-modal {
      background: none;
      border: 1px solid var(--utp-border);
      border-radius: 30px;
      color: #475569;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .btn-cancel-modal:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #cbd5e1;
    }
    
    .animate-fade {
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ModeracionResenasComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly uiService = inject(UiService);

  readonly queue = signal<ModeracionResenaResponse[]>([]);
  readonly isLoading = signal<boolean>(true);

  // Reject state
  readonly activeRejectId = signal<number | null>(null);
  rejectReasonText = '';

  filterEstado = 'PENDIENTE';
  readonly searchTerm = signal<string>('');

  // Computed signal for dynamic client side search
  readonly filteredQueue = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const list = this.queue();
    if (!term) return list;
    return list.filter(r => 
      r.curso.nombre.toLowerCase().includes(term) || 
      r.docente.nombreCompleto.toLowerCase().includes(term) || 
      r.comentario.toLowerCase().includes(term) ||
      (r.estudiante && r.estudiante.nombreCompleto.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.loadQueue();
  }

  loadQueue(): void {
    this.isLoading.set(true);
    this.adminService.listarResenasPendientes(this.filterEstado).subscribe({
      next: (res) => {
        // Fallback filter in client-side to safeguard in case backend API ignores the estado parameter 
        // and returns all reviews or doesn't support other state listings
        let list = res;
        if (res && res.length > 0) {
          // If the backend returned items that do not match the current filterEstado, 
          // filter them out client-side so they don't corrupt the view
          list = res.filter(r => r.estado === this.filterEstado);
        }
        this.queue.set(list);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  calculateAverage(res: ModeracionResenaResponse): number {
    if (!res.calificaciones || res.calificaciones.length === 0) return 0;
    const sum = res.calificaciones.reduce((acc, c) => acc + c.puntaje, 0);
    return sum / res.calificaciones.length;
  }



  approve(id: number): void {
    this.uiService.confirm('Aprobar Reseña', '¿Estás seguro de que deseas aprobar esta reseña para que sea pública?').subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.aprobarResena(id).subscribe({
          next: () => {
            this.uiService.showSuccess('Reseña aprobada con éxito.');
            this.loadQueue();
          }
        });
      }
    });
  }

  startReject(id: number): void {
    this.activeRejectId.set(id);
    this.rejectReasonText = '';
  }

  cancelReject(): void {
    this.activeRejectId.set(null);
    this.rejectReasonText = '';
  }

  confirmReject(id: number): void {
    if (!this.rejectReasonText.trim()) return;

    this.adminService.rechazarResena(id, { motivoRechazo: this.rejectReasonText.trim() }).subscribe({
      next: () => {
        this.uiService.showSuccess('Reseña rechazada con éxito.');
        this.cancelReject();
        this.loadQueue();
      }
    });
  }

  hide(id: number): void {
    this.uiService.confirm('Ocultar Reseña', '¿Estás seguro de que deseas ocultar esta reseña aprobada?').subscribe((confirmed) => {
      if (confirmed) {
        this.adminService.ocultarResena(id).subscribe({
          next: () => {
            this.uiService.showSuccess('Reseña ocultada con éxito.');
            this.loadQueue();
          }
        });
      }
    });
  }
}
