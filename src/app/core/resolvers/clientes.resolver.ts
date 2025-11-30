import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Cliente } from '@core/models/cliente.model';
import { ClienteService } from '@core/services/cliente.service';

export const clientesResolver: ResolveFn<Cliente[]> = () => {
  const service = inject(ClienteService);
  return service.listar();
};


