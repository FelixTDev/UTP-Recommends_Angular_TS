import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="star-rating-container" [class.read-only]="readOnly">
      @for (star of stars; track star) {
        <i 
          class="bi" 
          [class.bi-star-fill]="isFullStar(star)"
          [class.bi-star-half]="isHalfStar(star)"
          [class.bi-star]="isEmptyStar(star)"
          (click)="onStarClick(star)"
          (mouseenter)="onMouseEnter(star)"
          (mouseleave)="onMouseLeave()"
        ></i>
      }
      @if (showValue && value > 0) {
        <span class="rating-value">{{ value | number:'1.1-1' }}</span>
      }
    </div>
  `,
  styles: [`
    .star-rating-container {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 1.25rem;
    }
    i {
      color: #ffc107;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    i:hover {
      transform: scale(1.2);
    }
    .read-only i {
      cursor: default;
    }
    .read-only i:hover {
      transform: none;
    }
    .rating-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: #6c757d;
      margin-left: 8px;
    }
  `]
})
export class StarRatingComponent {
  @Input() value = 0;
  @Input() readOnly = false;
  @Input() showValue = false;
  @Output() valueChange = new EventEmitter<number>();

  protected readonly stars = [1, 2, 3, 4, 5];
  private hoverValue = signal<number | null>(null);

  protected get activeValue(): number {
    return this.hoverValue() !== null ? this.hoverValue()! : this.value;
  }

  protected isFullStar(star: number): boolean {
    return this.activeValue >= star;
  }

  protected isHalfStar(star: number): boolean {
    return this.activeValue >= star - 0.5 && this.activeValue < star;
  }

  protected isEmptyStar(star: number): boolean {
    return this.activeValue < star - 0.5;
  }

  protected onStarClick(star: number): void {
    if (this.readOnly) return;
    this.value = star;
    this.valueChange.emit(star);
  }

  protected onMouseEnter(star: number): void {
    if (this.readOnly) return;
    this.hoverValue.set(star);
  }

  protected onMouseLeave(): void {
    if (this.readOnly) return;
    this.hoverValue.set(null);
  }
}
