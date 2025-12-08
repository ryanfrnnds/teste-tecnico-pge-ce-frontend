import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ListaClientesStore } from './lista-clientes.store';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LoadingService } from '@infraestrutura/services/loading.service';
import { MessageService } from 'primeng/api';
import { Cliente } from '@dominio/models/cliente.model';

describe('ListaClientesStore', () => {
  let store: ListaClientesStore;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
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
      ativo: false
    }
  ];

  const activatedRouteStub = {
    snapshot: {
      queryParams: {
        pagina: '0',
        limite: '10',
        status: 'ativos',
        nome: '',
        cidade: ''
      }
    }
  } as unknown as ActivatedRoute;

  beforeEach(() => {
    clienteServiceSpy = jasmine.createSpyObj('ClienteService', [
      'buscarComFiltros',
      'contarTotalGeral',
      'atualizar',
      'inativarEmLote'
    ]);
    // Mock padrão que sempre retorna um Observable válido, independente dos parâmetros
    // Isso é importante porque o constructor faz várias chamadas com parâmetros diferentes
    clienteServiceSpy.buscarComFiltros.and.callFake(() => of({ clientes: [], total: 0 }));
    clienteServiceSpy.contarTotalGeral.and.callFake(() => of(0));
    clienteServiceSpy.atualizar.and.returnValue(of(mockCliente));
    clienteServiceSpy.inativarEmLote.and.returnValue(of(undefined));

    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['iniciar', 'finalizar'], {
      carregando: of(false)
    });

    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ListaClientesStore,
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    });

    store = TestBed.inject(ListaClientesStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve inicializar com valores padrão corretos', () => {
    expect(store.paginaAtual()).toBe(0);
    expect(store.registrosPorPagina()).toBe(10);
    expect(store.filtroStatus()).toBe('ativos');
    expect(store.filtrosForm.getRawValue()).toEqual({ nome: '', cidade: '' });
  });

  it('deve limpar filtros corretamente', () => {
    store.filtrosForm.patchValue({ nome: 'Ana', cidade: 'Fortaleza' });
    store.clientesSelecionados.set([mockCliente]);

    store.limparFiltros();

    expect(store.filtrosForm.getRawValue()).toEqual({ nome: '', cidade: '' });
    expect(store.clientesSelecionados()).toEqual([]);
  });

  it('deve atualizar status e limpar seleção ao filtrar por status', async () => {
    store.clientesSelecionados.set([mockCliente]);
    clienteServiceSpy.buscarComFiltros.and.callFake(() => of({ clientes: mockClientes, total: 2 }));
    clienteServiceSpy.contarTotalGeral.and.callFake(() => of(2));

    await store.filtrarPorStatus('inativos');

    expect(store.filtroStatus()).toBe('inativos');
    expect(store.clientesSelecionados()).toEqual([]);
    expect(store.paginaAtual()).toBe(0);
  });

  it('deve chamar ClienteService.buscarComFiltros ao buscarClientes', async () => {
    clienteServiceSpy.buscarComFiltros.and.returnValue(
      of({ clientes: mockClientes, total: 2 })
    );

    await store.buscarClientes({
      nome: 'Ana',
      cidade: 'Fortaleza',
      status: 'ativos',
      pagina: 0,
      limite: 10
    });

    expect(clienteServiceSpy.buscarComFiltros).toHaveBeenCalledWith({
      nome: 'Ana',
      cidade: 'Fortaleza',
      status: 'ativos',
      pagina: 0,
      limite: 10
    });
    expect(store.clientes()).toEqual(mockClientes);
    expect(store.totalRegistrosFiltrados()).toBe(2);
  });

  it('deve atualizar página ao mudar paginação', async () => {
    clienteServiceSpy.buscarComFiltros.and.returnValue(
      of({ clientes: mockClientes, total: 2 })
    );

    const event = { first: 10, rows: 20 };
    await store.onMudancaPagina(event);

    expect(store.paginaAtual()).toBe(10);
    expect(store.registrosPorPagina()).toBe(20);
  });

  it('deve navegar para edição ao chamar editarCliente', () => {
    store.editarCliente(mockCliente);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clientes', mockCliente.id, 'editar']);
  });

  it('deve navegar para novo cliente ao chamar novoCliente', () => {
    store.novoCliente();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clientes/novo']);
  });

  it('deve abrir modal de alteração de status para cliente individual', () => {
    store.abrirModalAlteracaoStatus(mockCliente);
    expect(store.clienteParaAlterar()).toEqual(mockCliente);
    expect(store.modalConfirmacaoVisible()).toBe(true);
  });

  it('deve abrir modal de alteração de status em massa', () => {
    store.clientesSelecionados.set([mockCliente]);
    store.abrirModalAlteracaoStatusEmMassa();
    expect(store.clienteParaAlterar()).toBeNull();
    expect(store.modalConfirmacaoVisible()).toBe(true);
  });

  it('deve cancelar alteração de status', () => {
    store.clienteParaAlterar.set(mockCliente);
    store.modalConfirmacaoVisible.set(true);
    
    store.cancelarAlteracaoStatus();
    
    expect(store.modalConfirmacaoVisible()).toBe(false);
    expect(store.clienteParaAlterar()).toBeNull();
  });

  it('deve inativar cliente individual', async () => {
    clienteServiceSpy.atualizar.and.returnValue(of({ ...mockCliente, ativo: false }));
    clienteServiceSpy.buscarComFiltros.and.callFake(() => of({ clientes: mockClientes, total: 2 }));
    clienteServiceSpy.contarTotalGeral.and.callFake(() => of(2));

    store.clienteParaAlterar.set(mockCliente);
    store.modalConfirmacaoVisible.set(true);

    await store.executarAlteracaoStatus();

    expect(clienteServiceSpy.atualizar).toHaveBeenCalledWith(mockCliente.id, { ativo: false });
    expect(messageServiceSpy.add).toHaveBeenCalled();
    expect(store.modalConfirmacaoVisible()).toBe(false);
  });

  it('deve reativar cliente individual', async () => {
    const clienteInativo = { ...mockCliente, ativo: false };
    clienteServiceSpy.atualizar.and.returnValue(of({ ...clienteInativo, ativo: true }));
    clienteServiceSpy.buscarComFiltros.and.callFake(() => of({ clientes: mockClientes, total: 2 }));
    clienteServiceSpy.contarTotalGeral.and.callFake(() => of(2));

    store.clienteParaAlterar.set(clienteInativo);
    store.modalConfirmacaoVisible.set(true);

    await store.executarAlteracaoStatus();

    expect(clienteServiceSpy.atualizar).toHaveBeenCalledWith(clienteInativo.id, { ativo: true });
    expect(messageServiceSpy.add).toHaveBeenCalled();
  });

  it('deve inativar múltiplos clientes', async () => {
    store.clientesSelecionados.set([mockCliente]);
    store.filtroStatus.set('ativos');
    store.clienteParaAlterar.set(null);
    store.modalConfirmacaoVisible.set(true);

    clienteServiceSpy.inativarEmLote.and.returnValue(of(undefined));
    clienteServiceSpy.buscarComFiltros.and.callFake(() => of({ clientes: mockClientes, total: 2 }));
    clienteServiceSpy.contarTotalGeral.and.callFake(() => of(2));

    await store.executarAlteracaoStatus();

    expect(clienteServiceSpy.inativarEmLote).toHaveBeenCalledWith([mockCliente]);
    expect(store.clientesSelecionados()).toEqual([]);
    expect(store.modalConfirmacaoVisible()).toBe(false);
  });

  it('deve reativar múltiplos clientes', async () => {
    const clienteInativo = { ...mockCliente, ativo: false };
    store.clientesSelecionados.set([clienteInativo]);
    store.filtroStatus.set('inativos');
    store.clienteParaAlterar.set(null);
    store.modalConfirmacaoVisible.set(true);

    clienteServiceSpy.atualizar.and.returnValue(of({ ...clienteInativo, ativo: true }));
    clienteServiceSpy.buscarComFiltros.and.callFake(() => of({ clientes: mockClientes, total: 2 }));
    clienteServiceSpy.contarTotalGeral.and.callFake(() => of(2));

    await store.executarAlteracaoStatus();

    expect(clienteServiceSpy.atualizar).toHaveBeenCalled();
    expect(store.clientesSelecionados()).toEqual([]);
  });

  it('deve tratar erro ao inativar cliente', async () => {
    spyOn(console, 'error');
    
    clienteServiceSpy.atualizar.and.returnValue(throwError(() => new Error('Erro ao inativar')));
    clienteServiceSpy.buscarComFiltros.and.returnValue(of({ clientes: [], total: 0 }));
    clienteServiceSpy.contarTotalGeral.and.returnValue(of(0));
    
    store.clienteParaAlterar.set(mockCliente);
    store.modalConfirmacaoVisible.set(true);

    await store.executarAlteracaoStatus();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' })
    );
    expect(store.modalConfirmacaoVisible()).toBe(false);
    expect(store.clienteParaAlterar()).toBeNull();
  });

  it('deve calcular modoReativacao corretamente', () => {
    store.filtroStatus.set('inativos');
    expect(store.modoReativacao()).toBe(true);

    store.filtroStatus.set('ativos');
    expect(store.modoReativacao()).toBe(false);
  });

  it('deve navegar para detalhes do cliente ao clicar na linha', () => {
    store.onLinhaClienteClick(mockCliente);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clientes', mockCliente.id]);
  });
});
