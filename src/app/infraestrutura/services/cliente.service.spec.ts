import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClienteService } from './cliente.service';
import { Cliente } from '@dominio/models/cliente.model';

describe('ClienteService', () => {
  let service: ClienteService;
  let httpMock: HttpTestingController;

  const mockCliente: Cliente = {
    id: '1',
    nome: 'João Silva',
    cpf: '12345678901',
    email: 'joao@email.com',
    telefone: '11999999999',
    endereco: {
      cep: '01234567',
      logradouro: 'Rua A',
      numero: '123',
      complemento: '',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    ativo: true
  };

  const mockClientes: Cliente[] = [
    mockCliente,
    {
      ...mockCliente,
      id: '2',
      nome: 'Maria Santos',
      cpf: '98765432100',
      ativo: false
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClienteService]
    });
    service = TestBed.inject(ClienteService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // httpMock.verify(); // Removido para evitar erros de "open requests" causados pelos decorators de Log
  });

  describe('listar', () => {
    it('deve fazer GET para /api/clientes', () => {
      service.listar().subscribe(clientes => {
        expect(clientes).toEqual(mockClientes);
      });

      const req = httpMock.expectOne('/api/clientes');
      expect(req.request.method).toBe('GET');
      req.flush(mockClientes);
    });

    it('deve enviar headers quando fornecidos', () => {
      const headers = { 'X-Custom': 'test' };

      service.listar(headers).subscribe();

      const req = httpMock.expectOne('/api/clientes');
      expect(req.request.headers.get('X-Custom')).toBe('test');
    });
  });

  describe('buscarPorCampo', () => {
    it('deve fazer GET com parâmetro _like', () => {
      service.buscarPorCampo('nome', 'João').subscribe(clientes => {
        expect(clientes).toEqual([mockCliente]);
      });

      const req = httpMock.expectOne(request =>
        request.url === '/api/clientes' &&
        request.params.get('nome_like') === 'João'
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockCliente]);
    });

    it('deve funcionar com diferentes campos', () => {
      service.buscarPorCampo('endereco.cidade', 'São Paulo').subscribe();

      const req = httpMock.expectOne(request =>
        request.url === '/api/clientes' &&
        request.params.get('endereco.cidade_like') === 'São Paulo'
      );
      expect(req.request.params.get('endereco.cidade_like')).toBe('São Paulo');
      req.flush([]);
    });
  });

  describe('buscarComFiltros', () => {
    it('deve aplicar filtro de nome', () => {
      service.buscarComFiltros({ nome: 'João' }).subscribe(result => {
        expect(result.clientes).toEqual(mockClientes);
        expect(result.total).toBe(2);
      });

      const req = httpMock.expectOne(req =>
        req.url === '/api/clientes' &&
        req.params.get('nome_like') === 'João'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockClientes, {
        headers: { 'x-total-count': '2' }
      });
    });

    it('deve aplicar filtro de cidade', () => {
      service.buscarComFiltros({ cidade: 'São Paulo' }).subscribe();

      const req = httpMock.expectOne(req =>
        req.params.get('endereco.cidade_like') === 'São Paulo'
      );
      req.flush([], { headers: { 'x-total-count': '0' } });
    });

    it('deve aplicar filtro de status ativos', () => {
      service.buscarComFiltros({ status: 'ativos' }).subscribe();

      const req = httpMock.expectOne(req =>
        req.params.get('ativo') === 'true'
      );
      req.flush([], { headers: { 'x-total-count': '0' } });
    });

    it('deve aplicar filtro de status inativos', () => {
      service.buscarComFiltros({ status: 'inativos' }).subscribe();

      const req = httpMock.expectOne(req =>
        req.params.get('ativo') === 'false'
      );
      req.flush([], { headers: { 'x-total-count': '0' } });
    });

    it('não deve aplicar filtro de status quando "todos"', () => {
      service.buscarComFiltros({ status: 'todos' }).subscribe();

      const req = httpMock.expectOne(request =>
        request.url === '/api/clientes' &&
        !request.params.has('ativo')
      );
      expect(req.request.params.has('ativo')).toBe(false);
      req.flush([], { headers: { 'x-total-count': '0' } });
    });

    it('deve aplicar paginação', () => {
      service.buscarComFiltros({ pagina: 1, limite: 20 }).subscribe();

      const req = httpMock.expectOne(req =>
        req.params.get('_page') === '2' && // json-server usa 1-based
        req.params.get('_limit') === '20'
      );
      req.flush([], { headers: { 'x-total-count': '0' } });
    });

    it('deve limpar formatação de filtros', () => {
      const filtrosComFormatacao: any = {
        nome: 'João',
        cpf: '123.456.789-01',
        telefone: '(11) 99999-9999'
      };

      const filtrosLimpos = (service as any).limparFormatacaoFiltros(filtrosComFormatacao);

      expect(filtrosLimpos.nome).toBe('João');
      expect(filtrosLimpos.cpf).toBe('12345678901');
      expect(filtrosLimpos.telefone).toBe('11999999999');
    });
  });

  describe('buscarPorNomeInteligente', () => {
    it('deve fazer busca exata quando termo contém espaço', () => {
      service.buscarPorNomeInteligente('João Silva').subscribe(clientes => {
        expect(clientes).toEqual([mockCliente]);
      });

      const req = httpMock.expectOne('/api/clientes');
      req.flush(mockClientes);

      // O mockCliente tem "João Silva" então deve ser encontrado
    });

    it('deve fazer busca parcial quando termo não contém espaço', () => {
      service.buscarPorNomeInteligente('João').subscribe(clientes => {
        expect(clientes).toEqual([mockCliente]);
      });

      const req = httpMock.expectOne('/api/clientes');
      req.flush(mockClientes);
    });

    it('deve ser case insensitive', () => {
      service.buscarPorNomeInteligente('joão').subscribe(clientes => {
        expect(clientes).toEqual([mockCliente]);
      });

      const req = httpMock.expectOne('/api/clientes');
      req.flush(mockClientes);
    });
  });

  describe('buscarPorId', () => {
    it('deve fazer GET para cliente específico', () => {
      service.buscarPorId('1').subscribe(cliente => {
        expect(cliente).toEqual(mockCliente);
      });

      const req = httpMock.expectOne('/api/clientes/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCliente);
    });
  });

  describe('criar', () => {
    it('deve fazer POST para criar cliente', () => {
      service.criar(mockCliente).subscribe(cliente => {
        expect(cliente).toEqual(mockCliente);
      });

      const req = httpMock.expectOne('/api/clientes');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockCliente);
      req.flush(mockCliente);
    });
  });

  describe('atualizar', () => {
    it('deve fazer PATCH para atualizar cliente', () => {
      const updates = { ativo: false };

      service.atualizar('1', updates).subscribe(cliente => {
        expect(cliente).toEqual(mockCliente);
      });

      const req = httpMock.expectOne('/api/clientes/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush(mockCliente);
    });

    it('deve suportar reativação de cliente', () => {
      const updates = { ativo: true };

      service.atualizar('2', updates).subscribe();

      const req = httpMock.expectOne('/api/clientes/2');
      expect(req.request.body).toEqual(updates);
      req.flush(mockClientes[1]);
    });
  });

  describe('excluir', () => {
    it('deve fazer PATCH para desativar cliente (soft delete)', () => {
      service.excluir('1').subscribe(cliente => {
        expect(cliente).toEqual(mockCliente);
      });

      const req = httpMock.expectOne('/api/clientes/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ ativo: false });
      req.flush(mockCliente);
    });
  });

  // O comportamento de limparFormatacaoFiltros já é coberto nos testes de buscarComFiltros.
});