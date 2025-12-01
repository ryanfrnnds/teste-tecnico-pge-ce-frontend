import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LoggerService } from './logger.service';
import { AuthService } from './auth.service';

describe('LoggerService', () => {
  let service: LoggerService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      usuario: { username: 'admin' }
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }]
    });

    service = TestBed.inject(LoggerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve enviar POST para /api/logs ao registrar log', () => {
    service.registrar('TESTE', 'Mensagem de teste');

    const req = httpMock.expectOne('/api/logs');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.acao).toBe('TESTE');
    expect(req.request.body.mensagem).toBe('Mensagem de teste');
    expect(req.request.body.usuario).toBe('admin');
    expect(new Date(req.request.body.data).getTime()).not.toBeNaN();

    req.flush({});
  });

  it('deve tratar erro de forma silenciosa (apenas logar no console)', () => {
    const consoleSpy = spyOn(console, 'error');

    service.registrar('TESTE', 'Falha simulada');

    const req = httpMock.expectOne('/api/logs');
    req.flush('Erro', { status: 500, statusText: 'Server Error' });

    expect(consoleSpy).toHaveBeenCalled();
  });
});


