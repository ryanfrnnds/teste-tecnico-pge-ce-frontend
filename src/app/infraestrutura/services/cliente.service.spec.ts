import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClienteService } from './cliente.service';
import { Cliente } from '@dominio/models/cliente.model';

/**
 * Suite de testes para ClienteService.
 * 
 * Testa todas as operações CRUD de clientes, incluindo:
 * - Listagem de clientes
 * - Busca por diferentes critérios (nome, cidade, status)
 * - Criação, atualização e exclusão (soft delete)
 * - Paginação e filtros
 * 
 * @module ClienteService
 */
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
  });

  /**
   * Testes para o método listar().
   * Verifica se a requisição GET é feita corretamente para o endpoint de clientes.
   */
  describe('listar', () => {
    /**
     * Deve fazer uma requisição GET para /api/clientes e retornar a lista de clientes.
     */
    it('deve fazer GET para /api/clientes', () => {
      service.listar().subscribe(clientes => {
        expect(clientes).toEqual(mockClientes);
      });

      const req = httpMock.expectOne('/api/clientes');
      expect(req.request.method).toBe('GET');
      req.flush(mockClientes);
    });

    /**
     * Deve aceitar e enviar headers customizados na requisição.
     */
    it('deve enviar headers quando fornecidos', () => {
      const headers = { 'X-Custom': 'test' };

      service.listar(headers).subscribe();

      const req = httpMock.expectOne('/api/clientes');
      expect(req.request.headers.get('X-Custom')).toBe('test');
    });
  });

  /**
   * Testes para o método buscarPorCampo().
   * Verifica busca por campo específico usando o operador _like do json-server.
   */
  describe('buscarPorCampo', () => {
    /**
     * Deve fazer GET com parâmetro _like para buscar por nome.
     */
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

    /**
     * Deve funcionar com campos aninhados (ex: endereco.cidade).
     */
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

  /**
   * Testes para o método buscarComFiltros().
   * Verifica aplicação de múltiplos filtros, paginação e limpeza de formatação.
   */
  describe('buscarComFiltros', () => {
    /**
     * Deve aplicar filtro de nome e retornar total correto do header x-total-count.
     */
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

    /**
     * Deve aplicar filtro de cidade usando endereco.cidade_like.
     */
    it('deve aplicar filtro de cidade', () => {
      let result: any;
      service.buscarComFiltros({ cidade: 'São Paulo' }).subscribe(data => {
        result = data;
      });

      const req = httpMock.expectOne(req =>
        req.params.get('endereco.cidade_like') === 'São Paulo'
      );
      expect(req.request.method).toBe('GET');
      req.flush([], { headers: { 'x-total-count': '0' } });
      expect(result.clientes).toEqual([]);
      expect(result.total).toBe(0);
    });

    /**
     * Deve aplicar filtro para clientes ativos (ativo=true).
     */
    it('deve aplicar filtro de status ativos', () => {
      let result: any;
      service.buscarComFiltros({ status: 'ativos' }).subscribe(data => {
        result = data;
      });

      const req = httpMock.expectOne(req =>
        req.params.get('ativo') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush([], { headers: { 'x-total-count': '0' } });
      expect(result.clientes).toEqual([]);
      expect(result.total).toBe(0);
    });

    /**
     * Deve aplicar filtro para clientes inativos (ativo=false).
     */
    it('deve aplicar filtro de status inativos', () => {
      let result: any;
      service.buscarComFiltros({ status: 'inativos' }).subscribe(data => {
        result = data;
      });

      const req = httpMock.expectOne(req =>
        req.params.get('ativo') === 'false'
      );
      expect(req.request.method).toBe('GET');
      req.flush([], { headers: { 'x-total-count': '0' } });
      expect(result.clientes).toEqual([]);
      expect(result.total).toBe(0);
    });

    /**
     * Não deve adicionar parâmetro ativo quando status é "todos".
     */
    it('não deve aplicar filtro de status quando "todos"', () => {
      service.buscarComFiltros({ status: 'todos' }).subscribe();

      const req = httpMock.expectOne(request =>
        request.url === '/api/clientes' &&
        !request.params.has('ativo')
      );
      expect(req.request.params.has('ativo')).toBe(false);
      req.flush([], { headers: { 'x-total-count': '0' } });
    });

    /**
     * Deve converter página 0-based para 1-based (json-server) e aplicar limite.
     */
    it('deve aplicar paginação', () => {
      let result: any;
      service.buscarComFiltros({ pagina: 1, limite: 20 }).subscribe(data => {
        result = data;
      });

      const req = httpMock.expectOne(req =>
        req.params.get('_page') === '2' &&
        req.params.get('_limit') === '20'
      );
      expect(req.request.method).toBe('GET');
      req.flush([], { headers: { 'x-total-count': '0' } });
      expect(result.clientes).toEqual([]);
      expect(result.total).toBe(0);
    });

    /**
     * Deve remover formatação de CPF e telefone antes de enviar para o backend.
     */
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

  /**
   * Testes para o método buscarPorNomeInteligente().
   * Verifica lógica de busca inteligente que diferencia termos com e sem espaços.
   */
  describe('buscarPorNomeInteligente', () => {
    /**
     * Quando o termo contém espaço, deve buscar por todas as partes do termo.
     */
    it('deve fazer busca exata quando termo contém espaço', () => {
      service.buscarPorNomeInteligente('João Silva').subscribe(clientes => {
        expect(clientes).toEqual([mockCliente]);
      });

      const req = httpMock.expectOne('/api/clientes');
      req.flush(mockClientes);
    });

    /**
     * Quando o termo não contém espaço, deve buscar por qualquer palavra que contenha o termo.
     */
    it('deve fazer busca parcial quando termo não contém espaço', () => {
      service.buscarPorNomeInteligente('João').subscribe(clientes => {
        expect(clientes).toEqual([mockCliente]);
      });

      const req = httpMock.expectOne('/api/clientes');
      req.flush(mockClientes);
    });

    /**
     * A busca deve ser case insensitive (maiúsculas/minúsculas).
     */
    it('deve ser case insensitive', () => {
      service.buscarPorNomeInteligente('joão').subscribe(clientes => {
        expect(clientes).toEqual([mockCliente]);
      });

      const req = httpMock.expectOne('/api/clientes');
      req.flush(mockClientes);
    });
  });

  /**
   * Testes para o método buscarPorId().
   * Verifica busca de cliente por ID único.
   */
  describe('buscarPorId', () => {
    /**
     * Deve fazer GET para /api/clientes/{id} e retornar o cliente específico.
     */
    it('deve fazer GET para cliente específico', () => {
      service.buscarPorId('1').subscribe(cliente => {
        expect(cliente).toEqual(mockCliente);
      });

      const req = httpMock.expectOne('/api/clientes/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCliente);
    });
  });

  /**
   * Testes para o método criar().
   * Verifica criação de novo cliente e logging automático via decorator.
   */
  describe('criar', () => {
    /**
     * Deve fazer POST para /api/clientes com o payload do cliente.
     */
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

  /**
   * Testes para o método atualizar().
   * Verifica atualização parcial (PATCH) de cliente e logging automático.
   */
  describe('atualizar', () => {
    /**
     * Deve fazer PATCH para /api/clientes/{id} com apenas os campos a atualizar.
     */
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

    /**
     * Deve permitir reativar cliente inativo alterando ativo para true.
     */
    it('deve suportar reativação de cliente', () => {
      const updates = { ativo: true };

      service.atualizar('2', updates).subscribe();

      const req = httpMock.expectOne('/api/clientes/2');
      expect(req.request.body).toEqual(updates);
      req.flush(mockClientes[1]);
    });
  });

  /**
   * Testes para o método excluir().
   * Verifica soft delete (desativação) de cliente e logging automático.
   */
  describe('excluir', () => {
    /**
     * Deve fazer PATCH para desativar cliente (soft delete), não DELETE físico.
     */
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

  /**
   * Testes para o método inativarEmLote().
   * Verifica inativação em massa de clientes e logging automático.
   */
  describe('inativarEmLote', () => {
    /**
     * Deve fazer PATCH para /api/clientes/bulk-inactivate com lista de IDs.
     */
    it('deve fazer PATCH para inativar múltiplos clientes', () => {
      service.inativarEmLote(mockClientes).subscribe();

      const req = httpMock.expectOne('/api/clientes/bulk-inactivate');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ ids: ['1', '2'] });
      req.flush(null);
    });

    /**
     * Deve retornar undefined quando lista está vazia.
     */
    it('deve retornar undefined quando lista está vazia', (done) => {
      service.inativarEmLote([]).subscribe(result => {
        expect(result).toBeUndefined();
        done();
      });
    });
  });

  /**
   * Testes para logging automático via decorator.
   * Verifica se logs são registrados corretamente para diferentes ações.
   * Nota: O logging é feito via decorator, então não podemos testar diretamente aqui.
   * Os testes verificam que as chamadas HTTP são feitas corretamente.
   */
  describe('logging automático', () => {
    /**
     * Deve fazer PATCH para inativar cliente (deve registrar log de INATIVACAO via decorator).
     */
    it('deve fazer PATCH para inativar cliente (deve registrar log de INATIVACAO via decorator)', () => {
      const updates = { ativo: false };
      let cliente: any;
      service.atualizar('1', updates).subscribe(data => {
        cliente = data;
      });

      const req = httpMock.expectOne('/api/clientes/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockCliente, ativo: false });
      expect(cliente.ativo).toBe(false);
    });

    /**
     * Deve fazer PATCH para reativar cliente (deve registrar log de ATUALIZACAO via decorator).
     */
    it('deve fazer PATCH para reativar cliente (deve registrar log de ATUALIZACAO via decorator)', () => {
      const updates = { ativo: true };
      let cliente: any;
      service.atualizar('2', updates).subscribe(data => {
        cliente = data;
      });

      const req = httpMock.expectOne('/api/clientes/2');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockClientes[1], ativo: true });
      expect(cliente.ativo).toBe(true);
    });

    /**
     * Deve fazer PATCH para outras atualizações (deve registrar log de ATUALIZACAO via decorator).
     */
    it('deve fazer PATCH para outras atualizações (deve registrar log de ATUALIZACAO via decorator)', () => {
      const updates = { nome: 'Novo Nome' };
      let cliente: any;
      service.atualizar('1', updates).subscribe(data => {
        cliente = data;
      });

      const req = httpMock.expectOne('/api/clientes/1');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updates);
      req.flush({ ...mockCliente, nome: 'Novo Nome' });
      expect(cliente.nome).toBe('Novo Nome');
    });
  });
});