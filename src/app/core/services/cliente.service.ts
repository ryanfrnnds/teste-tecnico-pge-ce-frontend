import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { LogOperation } from '@core/decorators/log-operation.decorator';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = '/api/clientes';

  constructor(private http: HttpClient, private logger: LoggerService) {}

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  buscarPorId(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  @LogOperation('CRIACAO', (args) => `Cliente ${args[0].nome} criado`)
  criar(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  @LogOperation('ATUALIZACAO', (args) => `Cliente ${args[0].id} atualizado`)
  atualizar(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${cliente.id}`, cliente);
  }

  @LogOperation('EXCLUSAO', (args) => `Cliente ${args[0]} excluído`)
  excluir(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

