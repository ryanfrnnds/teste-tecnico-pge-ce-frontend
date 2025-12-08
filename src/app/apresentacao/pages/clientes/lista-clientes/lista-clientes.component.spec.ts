import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, EMPTY } from 'rxjs';
import { ListaClientesComponent } from './lista-clientes.component';
import { ListaClientesStore } from './lista-clientes.store';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LoadingService } from '@infraestrutura/services/loading.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Cliente } from '@dominio/models/cliente.model';
import { GlobalPaginatorService } from '@infraestrutura/services/global-paginator.service';

describe('ListaClientesComponent', () => {
  let component: ListaClientesComponent;
  let fixture: ComponentFixture<ListaClientesComponent>;
  let store: ListaClientesStore;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockClientes: Cliente[] = [
    {
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
    },
    {
      id: '2',
      nome: 'Maria Santos',
      cpf: '98765432100',
      email: 'maria@email.com',
      telefone: '11988888888',
      endereco: {
        cep: '01234567',
        logradouro: 'Rua B',
        numero: '456',
        complemento: '',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP'
      },
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

  beforeEach(async () => {
    clienteServiceSpy = jasmine.createSpyObj('ClienteService', [
      'buscarComFiltros',
      'contarTotalGeral',
      'atualizar',
      'inativarEmLote'
    ]);
    clienteServiceSpy.buscarComFiltros.and.callFake(() => of({ clientes: [], total: 0 }));
    clienteServiceSpy.contarTotalGeral.and.callFake(() => of(0));
    clienteServiceSpy.atualizar.and.returnValue(of(mockClientes[0]));
    clienteServiceSpy.inativarEmLote.and.returnValue(of(undefined));

    loadingServiceSpy = jasmine.createSpyObj('LoadingService', ['iniciar', 'finalizar'], {
      carregando: of(false)
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    (routerSpy as any).events = EMPTY;
    (routerSpy as any).url = '/clientes';

    const globalPaginatorServiceSpy = jasmine.createSpyObj('GlobalPaginatorService', ['setPaginatorState', 'clearPaginatorState'], {
      state: { asReadonly: () => of(null) },
      callback: { asReadonly: () => of(null) }
    });

    await TestBed.configureTestingModule({
      imports: [ListaClientesComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: LoadingService, useValue: loadingServiceSpy },
        { provide: MessageService, useValue: { add: jasmine.createSpy('add') } },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: GlobalPaginatorService, useValue: globalPaginatorServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaClientesComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(ListaClientesStore);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve delegar filtrarPorStatus para a store', async () => {
    spyOn(store, 'filtrarPorStatus');
    await component.filtrarPorStatus('inativos');
    expect(store.filtrarPorStatus).toHaveBeenCalledWith('inativos');
  });

  it('deve delegar onMudancaPagina para a store', async () => {
    spyOn(store, 'onMudancaPagina');
    const event = { first: 10, rows: 20, page: 1 };
    await component.onMudancaPagina(event);
    expect(store.onMudancaPagina).toHaveBeenCalledWith(event);
  });

  it('deve limpar apenas o campo informado em limparCampo', () => {
    component.filtrosForm.patchValue({ nome: 'Ana', cidade: 'Fortaleza' });

    component.limparCampo('nome');

    expect(component.filtrosForm.value).toEqual({
      nome: '',
      cidade: 'Fortaleza'
    });
  });

  it('deve delegar limparFiltros para a store', () => {
    spyOn(store, 'limparFiltros');
    component.limparFiltros();
    expect(store.limparFiltros).toHaveBeenCalled();
  });

  it('deve delegar novoCliente para a store', () => {
    spyOn(store, 'novoCliente');
    component.novoCliente();
    expect(store.novoCliente).toHaveBeenCalled();
  });

  it('deve delegar onLinhaClienteClick para a store', () => {
    spyOn(store, 'onLinhaClienteClick');
    const cliente = mockClientes[0];
    component.onLinhaClienteClick(cliente);
    expect(store.onLinhaClienteClick).toHaveBeenCalledWith(cliente);
  });

  it('deve delegar editarCliente para a store', () => {
    spyOn(store, 'editarCliente');
    const cliente = mockClientes[0];
    component.editarCliente(cliente);
    expect(store.editarCliente).toHaveBeenCalledWith(cliente);
  });

  it('deve delegar abrirModalAlteracaoStatus para a store', () => {
    spyOn(store, 'abrirModalAlteracaoStatus');
    const cliente = mockClientes[0];
    component.abrirModalAlteracaoStatus(cliente);
    expect(store.abrirModalAlteracaoStatus).toHaveBeenCalledWith(cliente);
  });

  it('deve delegar abrirModalAlteracaoStatusEmMassa para a store', () => {
    spyOn(store, 'abrirModalAlteracaoStatusEmMassa');
    component.abrirModalAlteracaoStatusEmMassa();
    expect(store.abrirModalAlteracaoStatusEmMassa).toHaveBeenCalled();
  });

  it('deve delegar executarAlteracaoStatus para a store', async () => {
    spyOn(store, 'executarAlteracaoStatus');
    await component.executarAlteracaoStatus();
    expect(store.executarAlteracaoStatus).toHaveBeenCalled();
  });

  it('deve delegar cancelarAlteracaoStatus para a store', () => {
    spyOn(store, 'cancelarAlteracaoStatus');
    component.cancelarAlteracaoStatus();
    expect(store.cancelarAlteracaoStatus).toHaveBeenCalled();
  });

  it('deve retornar array de skeleton com tamanho correto', () => {
    store.registrosPorPagina.set(10);
    fixture.detectChanges();
    const skeletonArray = component.getSkeletonArray();
    expect(skeletonArray.length).toBe(10);
    expect(Array.isArray(skeletonArray)).toBe(true);
  });
});
