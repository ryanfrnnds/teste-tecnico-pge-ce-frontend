import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private requisicoesAtivas$ = new BehaviorSubject<number>(0);
  private carregando$ = new BehaviorSubject<boolean>(false);

  get carregando(): Observable<boolean> {
    return this.carregando$.asObservable();
  }

  get requisicoesAtivas(): Observable<number> {
    return this.requisicoesAtivas$.asObservable();
  }

  incrementarRequisicao(): void {
    const requisicoesAtuais = this.requisicoesAtivas$.value + 1;
    this.requisicoesAtivas$.next(requisicoesAtuais);

    if (requisicoesAtuais === 1) {
      this.carregando$.next(true);
    }
  }

  decrementarRequisicao(): void {
    const requisicoesAtuais = Math.max(0, this.requisicoesAtivas$.value - 1);
    this.requisicoesAtivas$.next(requisicoesAtuais);

    if (requisicoesAtuais === 0) {
      this.carregando$.next(false);
    }
  }

  iniciar(): void {
    this.incrementarRequisicao();
  }

  finalizar(): void {
    this.decrementarRequisicao();
  }
}
