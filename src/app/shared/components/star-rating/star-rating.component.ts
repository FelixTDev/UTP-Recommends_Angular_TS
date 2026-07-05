import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss'
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
