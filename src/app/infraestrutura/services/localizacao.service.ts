import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pais {
  id: number;
  codigo: string;
  nome: string;
}

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  paisId: number;
}

export interface Municipio {
  id: number;
  nome: string;
  estadoId: number;
}

export interface CepInfo {
  id: number;
  cep: string;
  logradouro: string;
  bairro: string;
  municipioId: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocalizacaoService {
  private readonly apiPaises = '/api/paises';
  private readonly apiEstados = '/api/estados';
  private readonly apiMunicipios = '/api/municipios';
  private readonly apiCeps = '/api/ceps';

  constructor(private readonly http: HttpClient) {}

  listarPaises(): Observable<Pais[]> {
    return this.http.get<Pais[]>(this.apiPaises);
  }

  listarEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(this.apiEstados);
  }

  listarMunicipios(): Observable<Municipio[]> {
    return this.http.get<Municipio[]>(this.apiMunicipios);
  }

  buscarCep(cep: string): Observable<CepInfo[]> {
    const params = new HttpParams().set('cep', cep.replace(/\D/g, ''));
    return this.http.get<CepInfo[]>(this.apiCeps, { params });
  }
}


