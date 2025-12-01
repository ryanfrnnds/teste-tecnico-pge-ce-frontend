import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { logsResolver } from './logs.resolver';
import { LogService } from '../services/log.service';
import { Log } from '../models/log.model';

describe('logsResolver', () => {
  let logServiceSpy: jasmine.SpyObj<LogService>;

  const mockLogs: Log[] = [
    {
      id: 1,
      data: '2025-12-01T00:00:00.000Z',
      acao: 'CRIACAO',
      mensagem: 'Cliente criado',
      usuario: 'admin'
    }
  ];

  beforeEach(() => {
    logServiceSpy = jasmine.createSpyObj('LogService', ['listar']);

    TestBed.configureTestingModule({
      providers: [{ provide: LogService, useValue: logServiceSpy }]
    });
  });

  it('deve resolver lista de logs usando LogService.listar', (done) => {
    logServiceSpy.listar.and.returnValue(of(mockLogs));

    TestBed.runInInjectionContext(() => {
      logsResolver().subscribe((result) => {
        expect(logServiceSpy.listar).toHaveBeenCalled();
        expect(result).toEqual(mockLogs);
        done();
      });
    });
  });
});


