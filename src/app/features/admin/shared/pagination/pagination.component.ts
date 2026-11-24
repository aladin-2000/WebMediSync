import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() currentPage = 0;
  @Output() pageChange = new EventEmitter<number>();
  /** Si renseigné, affiche un sélecteur « Lignes par page ». */
  @Input() pageSizeOptions: number[] = [];
  @Output() pageSizeChange = new EventEmitter<number>();

  /** La barre reste visible tant que le sélecteur de taille a un intérêt. */
  get visible(): boolean {
    return this.totalPages > 1
      || (this.pageSizeOptions.length > 0 && this.totalItems > Math.min(...this.pageSizeOptions));
  }

  onPageSizeSelect(value: string): void {
    this.pageSizeChange.emit(Number(value));
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get startItem(): number {
    return this.currentPage * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalItems);
  }

  get pages(): (number | '...')[] {
    const total = this.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }
    const current = this.currentPage;
    const pages: (number | '...')[] = [0];
    if (current > 2) pages.push('...');
    for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) {
      pages.push(i);
    }
    if (current < total - 3) pages.push('...');
    pages.push(total - 1);
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}
