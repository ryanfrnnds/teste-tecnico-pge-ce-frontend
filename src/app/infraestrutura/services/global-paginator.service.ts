import { Injectable, signal } from '@angular/core';

export interface PaginatorState {
  rows: number;
  first: number;
  totalRecords: number;
  rowsPerPageOptions: number[];
  showFirstLastIcon: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GlobalPaginatorService {
  private readonly paginatorState = signal<PaginatorState | null>(null);
  private readonly onPageChangeCallback = signal<((event: any) => void) | null>(null);

  readonly state = this.paginatorState.asReadonly();
  readonly callback = this.onPageChangeCallback.asReadonly();

  setPaginatorState(state: PaginatorState, onPageChange: (event: any) => void): void {
    this.paginatorState.set(state);
    this.onPageChangeCallback.set(onPageChange);
  }

  clearPaginatorState(): void {
    this.paginatorState.set(null);
    this.onPageChangeCallback.set(null);
  }
}

