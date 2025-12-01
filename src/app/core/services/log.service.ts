import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Log } from '../models/log.model';

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
}
