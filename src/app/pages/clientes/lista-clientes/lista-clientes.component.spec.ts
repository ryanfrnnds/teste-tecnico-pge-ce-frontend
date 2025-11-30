import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

import { ListaClientesComponent } from './lista-clientes.component';
import { ClienteService } from '@core/services/cliente.service';
import { LogService } from '@core/services/log.service';
import { LoadingService } from '@core/services/loading.service';
import { Cliente } from '@core/models/cliente.model';
import { ConfirmModalComponent } from '@core/components/confirm-modal/confirm-modal.component';

describe('ListaClientesComponent', () => {
  let component: ListaClientesComponent;
  let fixture: ComponentFixture<ListaClientesComponent>;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;
  let logServiceSpy: jasmine.SpyObj<LogService>;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteSpy: jasmine.SpyObj<ActivatedRoute>;
  let httpTestingController: HttpTestingController;

  const mockClientes: Cliente[] = [
    {
      id: '1',
      nome: 'João Silva',
      cpf: '12345678901',
      email: 'joao@email.com',
      telefone: '85999999999',
      endereco: {
        cep: '60123456',
        logradouro: 'Rua A',
        numero: '123',
        bairro: 'Centro',
        cidade: 'Fortaleza',
        estado: 'CE'
      },
      ativo: true
    },
    {
      id: '2',
      nome: 'Maria Santos',
      cpf: '98765432100',
      email: 'maria@email.com',
      telefone: '85888888888',
      endereco: {
        cep: '60234567',
        logradouro: 'Rua B',
        numero: '456',
        bairro: 'Aldeota',
        cidade: 'Fortaleza',
        estado: 'CE'
      },
      ativo: false
    }
  ];

  beforeEach(async () => {
    const clienteServiceMock = jasmine.createSpyObj('ClienteService', ['listar', 'excluir']);
    const logServiceMock = jasmine.createSpyObj('LogService', ['registrar']);
    const loadingServiceMock = jasmine.createSpyObj('LoadingService', [], { carregando: new BehaviorSubject(false) });
    const messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteMock = {
      queryParams: new BehaviorSubject({})
    };

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ListaClientesComponent
      ],
      providers: [
        { provide: ClienteService, useValue: clienteServiceMock },
        { provide: LogService, useValue: logServiceMock },
        { provide: LoadingService, useValue: loadingServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaClientesComponent);
    component = fixture.componentInstance;
    clienteServiceSpy = TestBed.inject(ClienteService) as jasmine.SpyObj<ClienteService>;
    logServiceSpy = TestBed.inject(LogService) as jasmine.SpyObj<LogService>;
    loadingServiceSpy = TestBed.inject(LoadingService) as jasmine.SpyObj<LoadingService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteSpy = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('deve carregar filtros e paginação da URL no ngOnInit', fakeAsync(() => {
      const queryParams = { busca: 'João', status: 'ativos', pagina: '20', limite: '25' };
      (activatedRouteSpy.queryParams as any).next(queryParams);

      clienteServiceSpy.listar.and.returnValue(of(mockClientes));

      component.ngOnInit();
      tick();

      expect(component.termoBusca).toBe('João');
      expect(component.filtroStatus).toBe('ativos');
      expect(component.paginaAtual).toBe(20);
      expect(component.registrosPorPagina).toBe(25);
      expect(clienteServiceSpy.listar).toHaveBeenCalled();
    }));

    it('deve lidar com parâmetros vazios na URL', fakeAsync(() => {
      const queryParams = {};
      (activatedRouteSpy.queryParams as any).next(queryParams);

      clienteServiceSpy.listar.and.returnValue(of(mockClientes));

      component.ngOnInit();
      tick();

      expect(component.termoBusca).toBe('');
      expect(component.filtroStatus).toBe('todos');
      expect(clienteServiceSpy.listar).toHaveBeenCalled();
    }));
  });

  describe('carregarClientes', () => {
    it('deve carregar clientes com sucesso', fakeAsync(() => {
      clienteServiceSpy.listar.and.returnValue(of(mockClientes));

      component.carregarClientes();
      tick();

      expect(component.clientes).toEqual(mockClientes);
      expect(component.clientesFiltrados).toEqual(mockClientes);
    }));

    it('deve lidar com erro ao carregar clientes', fakeAsync(() => {
      const error = new Error('Erro de API');
      clienteServiceSpy.listar.and.returnValue(throwError(() => error));

      component.carregarClientes();
      tick();

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível carregar os clientes.'
      });
    }));
  });

  describe('aplicarFiltros', () => {
    beforeEach(() => {
      component.clientes = mockClientes;
    });

    it('deve filtrar por status ativo', () => {
      component.filtroStatus = 'ativos';
      component.aplicarFiltros(false);

      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.clientesFiltrados[0].id).toBe('1');
    });

    it('deve filtrar por status inativo', () => {
      component.filtroStatus = 'inativos';
      component.aplicarFiltros(false);

      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.clientesFiltrados[0].id).toBe('2');
    });

    it('deve filtrar por termo de busca (nome)', () => {
      component.termoBusca = 'João';
      component.aplicarFiltros(false);

      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.clientesFiltrados[0].nome).toBe('João Silva');
    });

    it('deve filtrar por termo de busca (CPF)', () => {
      component.termoBusca = '12345678901';
      component.aplicarFiltros(false);

      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.clientesFiltrados[0].cpf).toBe('12345678901');
    });

    it('deve filtrar por termo de busca (email)', () => {
      component.termoBusca = 'joao@email.com';
      component.aplicarFiltros(false);

      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.clientesFiltrados[0].email).toBe('joao@email.com');
    });

    it('deve filtrar por termo de busca (telefone)', () => {
      component.termoBusca = '85999999999';
      component.aplicarFiltros(false);

      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.clientesFiltrados[0].telefone).toBe('85999999999');
    });

    it('deve filtrar por termo de busca (cidade)', () => {
      component.termoBusca = 'fortaleza';
      component.aplicarFiltros(false);

      expect(component.clientesFiltrados.length).toBe(2);
    });

    it('deve combinar filtros de status e busca', () => {
      component.filtroStatus = 'ativos';
      component.termoBusca = 'João';
      component.aplicarFiltros(false);

      expect(component.clientesFiltrados.length).toBe(1);
      expect(component.totalRegistrosFiltrados).toBe(1);
      expect(component.clientesFiltrados[0].nome).toBe('João Silva');
    });

    it('deve atualizar URL quando atualizarUrl é true', () => {
      component.termoBusca = 'teste';
      component.filtroStatus = 'ativos';

      component.aplicarFiltros(true);

      expect(routerSpy.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRouteSpy,
        queryParams: { busca: 'teste', status: 'ativos' },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  });

  describe('atualizarUrl', () => {
    it('deve atualizar URL com parâmetros de filtro e paginação', () => {
      component.termoBusca = 'João';
      component.filtroStatus = 'ativos';
      component.paginaAtual = 10;
      component.registrosPorPagina = 25;

      component.atualizarUrl();

      expect(routerSpy.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRouteSpy,
        queryParams: { busca: 'João', status: 'ativos', pagina: 10, limite: 25 },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });

    it('deve atualizar URL apenas com termo de busca', () => {
      component.termoBusca = 'Maria';
      component.filtroStatus = 'todos';

      component.atualizarUrl();

      expect(routerSpy.navigate).toHaveBeenCalledWith([], {
        relativeTo: activatedRouteSpy,
        queryParams: { busca: 'Maria' },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });
  });

  describe('onBuscaChange', () => {
    it('deve aplicar filtros quando busca muda', () => {
      spyOn(component, 'aplicarFiltros');

      component.onBuscaChange();

      expect(component.aplicarFiltros).toHaveBeenCalledWith();
    });
  });

  describe('onStatusChange', () => {
    it('deve aplicar filtros quando status muda', () => {
      spyOn(component, 'aplicarFiltros');

      component.onStatusChange();

      expect(component.aplicarFiltros).toHaveBeenCalledWith();
    });
  });

  describe('onMudancaPagina', () => {
    it('deve atualizar paginação e URL quando página muda', () => {
      const event = { first: 10, rows: 25 };
      spyOn(component, 'atualizarUrl');

      component.onMudancaPagina(event);

      expect(component.paginaAtual).toBe(10);
      expect(component.registrosPorPagina).toBe(25);
      expect(component.atualizarUrl).toHaveBeenCalled();
    });
  });

  describe('confirmarExclusao', () => {
    it('deve abrir modal de exclusão com cliente selecionado', () => {
      const cliente = mockClientes[0];

      component.confirmarExclusao(cliente);

      expect(component.modalExclusaoVisible).toBeTrue();
      expect(component.clienteParaExcluir).toBe(cliente);
    });
  });

  describe('executarExclusao', () => {
    it('deve excluir cliente com sucesso', fakeAsync(() => {
      component.clienteParaExcluir = mockClientes[0];
      clienteServiceSpy.excluir.and.returnValue(of(void 0));
      logServiceSpy.registrar.and.returnValue(of({} as any));
      spyOn(component, 'carregarClientes');

      component.executarExclusao();
      tick();

      expect(clienteServiceSpy.excluir).toHaveBeenCalledWith('1');
      expect(logServiceSpy.registrar).toHaveBeenCalledWith({
        acao: 'EXCLUSAO',
        mensagem: 'Cliente João Silva (ID: 1) excluído',
        usuario: 'usuario_logado'
      });
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Cliente excluído com sucesso'
      });
      expect(component.carregarClientes).toHaveBeenCalled();
      expect(component.modalExclusaoVisible).toBeFalse();
      expect(component.clienteParaExcluir).toBeNull();
    }));

    it('deve lidar com erro na exclusão', fakeAsync(() => {
      component.clienteParaExcluir = mockClientes[0];
      clienteServiceSpy.excluir.and.returnValue(throwError(() => new Error('Erro')));

      component.executarExclusao();
      tick();

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao excluir cliente'
      });
      expect(component.modalExclusaoVisible).toBeFalse();
    }));

    it('não deve fazer nada se não há cliente para excluir', () => {
      component.clienteParaExcluir = null;

      component.executarExclusao();

      expect(clienteServiceSpy.excluir).not.toHaveBeenCalled();
    });
  });

  describe('cancelarExclusao', () => {
    it('deve fechar modal e limpar cliente selecionado', () => {
      component.modalExclusaoVisible = true;
      component.clienteParaExcluir = mockClientes[0];

      component.cancelarExclusao();

      expect(component.modalExclusaoVisible).toBeFalse();
      expect(component.clienteParaExcluir).toBeNull();
    });
  });

  describe('novoCliente', () => {
    it('deve mostrar mensagem de desenvolvimento', () => {
      component.novoCliente();

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Em desenvolvimento',
        detail: 'Cadastro de novo cliente será implementado em breve',
        life: 3000
      });
    });
  });

  describe('editarCliente', () => {
    it('deve mostrar mensagem de desenvolvimento', () => {
      const cliente = mockClientes[0];

      component.editarCliente(cliente);

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Em desenvolvimento',
        detail: `Edição de ${cliente.nome} será implementada em breve`,
        life: 3000
      });
    });
  });

  describe('Métodos utilitários', () => {
    describe('getSeveridadeStatus', () => {
      it('deve retornar success para cliente ativo', () => {
        const result = component.getSeveridadeStatus(true);
        expect(result).toBe('success');
      });

      it('deve retornar secondary para cliente inativo', () => {
        const result = component.getSeveridadeStatus(false);
        expect(result).toBe('secondary');
      });
    });

    describe('getTextoStatus', () => {
      it('deve retornar Ativo para cliente ativo', () => {
        const result = component.getTextoStatus(true);
        expect(result).toBe('Ativo');
      });

      it('deve retornar Inativo para cliente inativo', () => {
        const result = component.getTextoStatus(false);
        expect(result).toBe('Inativo');
      });
    });

    describe('formatarCPF', () => {
      it('deve formatar CPF corretamente', () => {
        const result = component.formatarCPF('12345678901');
        expect(result).toBe('123.456.789-01');
      });
    });

    describe('formatarTelefone', () => {
      it('deve formatar telefone corretamente', () => {
        const result = component.formatarTelefone('85999999999');
        expect(result).toBe('(85) 99999-9999');
      });
    });
  });

  describe('Estado inicial', () => {
    it('deve ter valores iniciais corretos', () => {
      expect(component.clientes).toEqual([]);
      expect(component.clientesFiltrados).toEqual([]);
      expect(component.termoBusca).toBe('');
      expect(component.filtroStatus).toBe('todos');
      expect(component.paginaAtual).toBe(0);
      expect(component.registrosPorPagina).toBe(10);
      expect(component.totalRegistrosFiltrados).toBe(0);
      expect(component.modalExclusaoVisible).toBeFalse();
      expect(component.clienteParaExcluir).toBeNull();
    });

    it('deve expor carregando$ do LoadingService', (done) => {
      component.carregando$.subscribe(carregando => {
        expect(typeof carregando).toBe('boolean');
        done();
      });
    });

    it('deve ter opções de status corretas', () => {
      expect(component.opcoesStatus).toEqual([
        { label: 'Todos', value: 'todos' },
        { label: 'Ativos', value: 'ativos' },
        { label: 'Inativos', value: 'inativos' }
      ]);
    });
  });
});
