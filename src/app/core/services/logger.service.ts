import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logsUrl = '/api/logs';

  static instance: LoggerService;

  constructor(private http: HttpClient, private authService: AuthService) {
    LoggerService.instance = this;
  }

  registrar(acao: string, mensagem: string): void {
    const log = {
      data: new Date().toISOString(),
      acao,
      mensagem,
      usuario: this.authService.usuario?.username ?? 'system'
    };

    this.http.post(this.logsUrl, log).subscribe({
      error: (err) => console.error('Falha ao registrar log', err)
    });
  }
}

