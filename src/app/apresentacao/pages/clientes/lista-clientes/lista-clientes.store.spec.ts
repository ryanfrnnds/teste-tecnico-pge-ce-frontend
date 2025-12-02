import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ListaClientesStore } from './lista-clientes.store';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LoadingService } from '@infraestrutura/services/loading.service';
import { MessageService } from 'primeng/api';

describe('ListaClientesStore', () => {
  let store: ListaClientesStore;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

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
    clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['buscarComFiltros']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ListaClientesStore,
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: LoadingService, useValue: { carregando: of(false) } },
        { provide: MessageService, useValue: { add: jasmine.createSpy('add') } },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    });

    store = TestBed.inject(ListaClientesStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('deve inicializar com valores padrão corretos', () => {
    expect(store.paginaAtual()).toBe(0);
    expect(store.registrosPorPagina()).toBe(10);
    expect(store.filtroStatus()).toBe('ativos');
    expect(store.filtrosForm.getRawValue()).toEqual({ nome: '', cidade: '' });
  });

  it('deve aplicar filtros redefinindo a página para 0', () => {
    store.paginaAtual.set(20);

    store.aplicarFiltros();

    expect(store.paginaAtual()).toBe(0);
  });

  it('deve atualizar status e limpar seleção ao filtrar por status', () => {
    store.clientesSelecionados.set([{ id: '1' } as any]);

    store.filtrarPorStatus('inativos');

    expect(store.filtroStatus()).toBe('inativos');
    expect(store.clientesSelecionados()).toEqual([]);
    expect(store.paginaAtual()).toBe(0);
  });

  it('deve chamar ClienteService.buscarComFiltros ao buscarClientes', async () => {
    clienteServiceSpy.buscarComFiltros.and.returnValue(
      of({ clientes: [], total: 0 }) as any
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
  });
});


