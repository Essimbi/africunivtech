import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  private _page = signal(1);
  private _totalPages = signal(1);

  @Input() set page(v: number) { this._page.set(v || 1); }
  @Input() set totalPages(v: number) { this._totalPages.set(v || 1); }
  @Output() pageChange = new EventEmitter<number>();

  currentPage = computed(() => this._page());
  pages = computed(() => {
    const total = this._totalPages();
    const current = this._page();
    const window = 2;
    const start = Math.max(1, current - window);
    const end = Math.min(total, current + window);
    const result: number[] = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  });
  totalPagesValue = computed(() => this._totalPages());

  go(p: number): void {
    if (p < 1 || p > this._totalPages() || p === this._page()) return;
    this.pageChange.emit(p);
  }
}
