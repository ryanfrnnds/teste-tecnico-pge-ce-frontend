import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ListaClientesComponent } from './lista-clientes.component';
import { ListaClientesStore } from './lista-clientes.store';
import { Cliente } from '@core/models/cliente.model';

describe('ListaClientesComponent', () => {
  let component: ListaClientesComponent;
  let fixture: ComponentFixture<ListaClientesComponent>;
  let storeMock: jasmine.SpyObj<ListaClientesStore>;

  const fb = new FormBuilder();

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
    }
  ];

  beforeEach(async () => {
    const filtrosForm = fb.group({
      nome: [''],
      cidade: ['']
    });

    const store: Partial<ListaClientesStore> = {
      clientes: signal<Cliente[]>(mockClientes),
      filtrosForm,
      paginatorState: signal({ first: 0, rows: 10, page: 0, pageCount: 1 }),
      totalRegistrosFiltrados: signal(1),
      carregando$: of(false),
      filtroStatus: signal<'ativos' | 'inativos' | 'todos'>('ativos'),
      clientesSelecionados: signal<Cliente[]>([]),
      modalExclusaoVisible: signal(false),
      clienteParaExcluir: signal<Cliente | null>(null),
      contagemTotal: signal(1),
      contagemAtivos: signal(1),
      contagemInativos: signal(0),
      listaVaziaSemFiltros: computed(() => true),
      nenhumClienteCadastrado: computed(() => false),
      modoReativacao: computed(() => false),
      skeletonArray: computed(() => [0, 0, 0]),
      aplicarFiltros: jasmine.createSpy('aplicarFiltros'),
      filtrarPorStatus: jasmine.createSpy('filtrarPorStatus'),
      onMudancaPagina: jasmine.createSpy('onMudancaPagina'),
      confirmarExclusao: jasmine.createSpy('confirmarExclusao'),
      executarExclusao: jasmine.createSpy('executarExclusao'),
      executarExclusaoEmMassa: jasmine.createSpy('executarExclusaoEmMassa'),
      limparFiltros: jasmine.createSpy('limparFiltros'),
      novoCliente: jasmine.createSpy('novoCliente'),
      inserirClientesTeste: jasmine.createSpy('inserirClientesTeste'),
      onLinhaClienteClick: jasmine.createSpy('onLinhaClienteClick'),
      editarCliente: jasmine.createSpy('editarCliente'),
      cancelarExclusao: jasmine.createSpy('cancelarExclusao')
    };

    storeMock = store as jasmine.SpyObj<ListaClientesStore>;

    await TestBed.configureTestingModule({
      imports: [ListaClientesComponent, ReactiveFormsModule],
      providers: [{ provide: ListaClientesStore, useValue: storeMock }]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve delegar aoPesquisar para a store', () => {
    component.aoPesquisar();
    expect(storeMock.aplicarFiltros).toHaveBeenCalled();
  });

  it('deve delegar filtrarPorStatus para a store', () => {
    component.filtrarPorStatus('inativos');
    expect(storeMock.filtrarPorStatus).toHaveBeenCalledWith('inativos');
  });

  it('deve delegar onMudancaPagina para a store', () => {
    const event = { first: 10, rows: 20, page: 1 };
    component.onMudancaPagina(event);
    expect(storeMock.onMudancaPagina).toHaveBeenCalledWith(event);
  });

  it('deve limpar apenas o campo informado em limparCampo', () => {
    storeMock.filtrosForm.patchValue({ nome: 'Ana', cidade: 'Fortaleza' });

    component.limparCampo('nome');

    expect(storeMock.filtrosForm.value).toEqual({
      nome: '',
      cidade: 'Fortaleza'
    });
  });

  it('deve delegar limparFiltros para a store', () => {
    component.limparFiltros();
    expect(storeMock.limparFiltros).toHaveBeenCalled();
  });

  it('deve delegar confirmarExclusaoEmMassa para a store', () => {
    component.confirmarExclusaoEmMassa();
    expect(storeMock.executarExclusaoEmMassa).toHaveBeenCalled();
  });

  it('deve delegar novoCliente para a store', () => {
    component.novoCliente();
    expect(storeMock.novoCliente).toHaveBeenCalled();
  });

  it('deve delegar inserirClientesTeste para a store', () => {
    component.inserirClientesTeste();
    expect(storeMock.inserirClientesTeste).toHaveBeenCalled();
  });
});