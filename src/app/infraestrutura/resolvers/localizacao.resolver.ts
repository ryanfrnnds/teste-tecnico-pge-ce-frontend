import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  LocalizacaoService,
  Pais,
  Estado,
  Municipio,
  CepInfo
} from '@infraestrutura/services/localizacao.service';

export interface LocalizacaoData {
  paises: Pais[];
  estados: Estado[];
  municipios: Municipio[];
  ceps: CepInfo[];
}

export const localizacaoResolver: ResolveFn<LocalizacaoData> = () => {
  const service = inject(LocalizacaoService);

  return forkJoin({
    paises: service.listarPaises(),
    estados: service.listarEstados(),
    municipios: service.listarMunicipios(),
    ceps: service.buscarCep('')
  });
};


