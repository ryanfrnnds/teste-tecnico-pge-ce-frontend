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

  limparTodosLogs(): Observable<void> {
    return this.listar().pipe(
      switchMap(logs => {
        if (!logs || logs.length === 0) return of(undefined);
        const deleteObservables = logs.map(log => 
          this.http.delete(`${this.apiUrl}/${log.id}`)
        );
        return forkJoin(deleteObservables).pipe(map(() => undefined));
      })
    );
  }
}
