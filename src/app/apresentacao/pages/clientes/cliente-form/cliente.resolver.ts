import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LocalizacaoService } from '@infraestrutura/services/localizacao.service';
import { Cliente } from '@dominio/models/cliente.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ClienteFormData {
  cliente: Cliente | null;
  paises: any[];
  estados: any[];
  municipios: any[];
}

export const clienteResolver: ResolveFn<ClienteFormData> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const clienteService = inject(ClienteService);
  const localizacaoService = inject(LocalizacaoService);
  const id = route.paramMap.get('id');

  return forkJoin({
    cliente: id ? clienteService.buscarPorId(id).pipe(
      catchError(() => of(null))
    ) : of(null),
    paises: localizacaoService.listarPaises().pipe(
      catchError(() => of([]))
    ),
    estados: localizacaoService.listarEstados().pipe(
      catchError(() => of([]))
    ),
    municipios: localizacaoService.listarMunicipios().pipe(
      catchError(() => of([]))
    )
  }).pipe(
    map(({ cliente, paises, estados, municipios }) => ({
      cliente,
      paises,
      estados,
      municipios
    }))
  );
};

