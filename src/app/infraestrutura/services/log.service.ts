import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Log } from '@dominio/models/log.model';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  private apiUrl = '/api/logs';

  constructor(private http: HttpClient, private authService: AuthService) {}

  listar(): Observable<Log[]> {
    return this.http.get<Log[]>(this.apiUrl);
  }

  registrar(log: Partial<Log>): Observable<Log> {
    const usuario = this.authService.usuario?.username ?? 'system';
    const novoLog = {
      ...log,
      data: new Date().toISOString(),
      usuario
    };
    return this.http.post<Log>(this.apiUrl, novoLog);
  }

  /**
   * Remove múltiplos logs de uma vez usando endpoint de remoção em lote
   * @param ids Lista de IDs dos logs a serem removidos
   */
  excluirEmLote(ids: number[]): Observable<void> {
    if (!ids || ids.length === 0) {
      return of(undefined);
    }
    // Usa POST porque DELETE não suporta body em alguns casos
    return this.http.post<void>(`${this.apiUrl}/bulk-delete`, { ids }).pipe(
      map(() => undefined)
    );
  }

  /**
   * Limpa todos os logs usando remoção em lote
   */
  limparTodosLogs(): Observable<void> {
    return this.listar().pipe(
      switchMap(logs => {
        if (!logs || logs.length === 0) return of(undefined);
        // Coletar todos os IDs e fazer uma única chamada
        const ids = logs.map(log => log.id);
        return this.excluirEmLote(ids).pipe(map(() => undefined));
      })
    );
  }
}
