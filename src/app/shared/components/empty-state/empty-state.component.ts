import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="icon-container">
        <i class="bi" [class]="icon"></i>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      @if (actionText) {
        <button class="btn-primary-glass" (click)="onActionClick()">
          {{ actionText }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      background: var(--utp-surface);
      border-radius: 12px;
      border: 1px solid var(--utp-border);
      margin: 24px 0;
      box-shadow: var(--card-shadow);
    }
    .icon-container {
      font-size: 3.5rem;
      color: var(--utp-text-muted);
      margin-bottom: 16px;
      animation: float 3s ease-in-out infinite;
    }
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--utp-text);
      margin-bottom: 8px;
    }
    p {
      font-size: 0.95rem;
      color: var(--utp-text-secondary);
      max-width: 400px;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    button {
      padding: 10px 24px;
      font-size: 0.9rem;
    }
    @keyframes float {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-8px);
      }
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'bi-folder-x';
  @Input() title = 'Sin resultados';
  @Input() description = 'No se encontraron registros para mostrar en esta sección.';
  @Input() actionText = '';
  @Output() action = new EventEmitter<void>();

  onActionClick(): void {
    this.action.emit();
  }
}
