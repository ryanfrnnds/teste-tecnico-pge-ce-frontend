import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'pge-theme-mode';
const DARK_CLASS = 'my-app-dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly modoSubject = new BehaviorSubject<ThemeMode>('dark');
  readonly modo$ = this.modoSubject.asObservable();

  constructor(@Inject(DOCUMENT) private readonly document: Document) {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode | null);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialMode: ThemeMode =
      stored === 'light' || stored === 'dark'
        ? stored
        : prefersDark
          ? 'dark'
          : 'dark'; // padrão: dark

    this.applyMode(initialMode, false);
    this.modoSubject.next(initialMode);
  }

  alternarTema(): void {
    const atual = this.modoSubject.value;
    const proximo: ThemeMode = atual === 'dark' ? 'light' : 'dark';
    this.applyMode(proximo);
    this.modoSubject.next(proximo);
  }

  private applyMode(modo: ThemeMode, persistir: boolean = true): void {
    const root = this.document.documentElement;

    if (modo === 'dark') {
      root.classList.add(DARK_CLASS);
    } else {
      root.classList.remove(DARK_CLASS);
    }

    if (persistir) {
      localStorage.setItem(STORAGE_KEY, modo);
    }
  }
}


