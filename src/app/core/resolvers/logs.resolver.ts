import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Log } from '@core/models/log.model';
import { LogService } from '@core/services/log.service';

export const logsResolver: ResolveFn<Log[]> = () => {
  const service = inject(LogService);
  return service.listar();
};


