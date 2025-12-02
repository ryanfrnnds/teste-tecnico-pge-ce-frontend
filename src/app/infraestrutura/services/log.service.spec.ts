import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LogService } from './log.service';
import { AuthService } from './auth.service';
import { Log } from '@dominio/models/log.model';

describe('LogService', () => {
  let service: LogService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockLog: Log = {
    id: 1,
    data: '2025-12-01T00:00:00.000Z',
    acao: 'CRIACAO',
    mensagem: 'Teste',
    usuario: 'admin'
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      usuario: { username: 'admin' }
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    });

    service = TestBed.inject(LogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar logs com GET em /api/logs', () => {
    service.listar().subscribe((logs) => {
      expect(logs).toEqual([mockLog]);
    });

    const req = httpMock.expectOne('/api/logs');
    expect(req.request.method).toBe('GET');
    req.flush([mockLog]);
  });

  it('deve registrar log incluindo usuário autenticado e data', () => {
    const parcial: Partial<Log> = {
      acao: 'CRIACAO',
      mensagem: 'Algo aconteceu'
    };

    service.registrar(parcial).subscribe((logCriado) => {
      expect(logCriado.acao).toBe('CRIACAO');
      expect(logCriado.mensagem).toBe('Algo aconteceu');
      expect(logCriado.usuario).toBe('admin');
      expect(new Date(logCriado.data).getTime()).not.toBeNaN();
    });

    const req = httpMock.expectOne('/api/logs');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.acao).toBe('CRIACAO');
    expect(req.request.body.mensagem).toBe('Algo aconteceu');
    expect(req.request.body.usuario).toBe('admin');
    expect(new Date(req.request.body.data).getTime()).not.toBeNaN();

    req.flush({
      ...mockLog,
      ...req.request.body
    });
  });
});


