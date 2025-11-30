import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ClienteService } from './cliente.service';
import { LoggerService } from './logger.service';
import { Cliente } from '../models/cliente.model';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  const mockCliente: Cliente = {
    id: '1',
    nome: 'Teste',
    cpf: '123',
    email: 'teste@email.com',
    telefone: '123',
    endereco: {
      cep: '000', logradouro: 'Rua', numero: '1', bairro: 'B', cidade: 'C', estado: 'CE'
    },
    ativo: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ClienteService,
        LoggerService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ClienteService);
    TestBed.inject(LoggerService); 
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('listar() deve realizar GET em /api/clientes', () => {
    service.listar().subscribe(clientes => {
      expect(clientes.length).toBe(1);
      expect(clientes[0]).toEqual(mockCliente);
    });

    const req = httpMock.expectOne('/api/clientes');
    expect(req.request.method).toBe('GET');
    req.flush([mockCliente]);
  });

  it('criar() deve realizar POST e acionar LoggerService (Decorator)', () => {
    service.criar(mockCliente).subscribe(novoCliente => {
      expect(novoCliente).toEqual(mockCliente);
    });

    const reqCliente = httpMock.expectOne('/api/clientes');
    expect(reqCliente.request.method).toBe('POST');
    reqCliente.flush(mockCliente);

    const reqLog = httpMock.expectOne('/api/logs');
    expect(reqLog.request.method).toBe('POST');
    expect(reqLog.request.body.acao).toBe('CRIACAO');
    reqLog.flush({});
  });

  it('atualizar() deve realizar PUT e acionar LoggerService (Decorator)', () => {
    service.atualizar(mockCliente).subscribe(res => {
      expect(res).toEqual(mockCliente);
    });

    const req = httpMock.expectOne(`/api/clientes/${mockCliente.id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockCliente);

    const reqLog = httpMock.expectOne('/api/logs');
    expect(reqLog.request.body.acao).toBe('ATUALIZACAO');
    reqLog.flush({});
  });

  it('excluir() deve realizar DELETE e acionar LoggerService (Decorator)', () => {
    service.excluir(mockCliente.id).subscribe();

    const req = httpMock.expectOne(`/api/clientes/${mockCliente.id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    const reqLog = httpMock.expectOne('/api/logs');
    expect(reqLog.request.body.acao).toBe('EXCLUSAO');
    reqLog.flush({});
  });
});

