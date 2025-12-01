import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { firstValueFrom, debounceTime, distinctUntilChanged } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Cliente } from '@core/models/cliente.model';
import { ClienteService } from '@core/services/cliente.service';
import { LoadingService } from '@core/services/loading.service';

const CLIENTES_QUERY_STORAGE_KEY = 'lista-clientes-query-params';

@Injectable()
export class ListaClientesStore {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly loadingService = inject(LoadingService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Estado reativo com signals
  readonly clientes = signal<Cliente[]>([]);
  readonly paginaAtual = signal(0);
  readonly registrosPorPagina = signal(10);
  readonly filtroStatus = signal<'ativos' | 'inativos' | 'todos'>('ativos');
  readonly clientesSelecionados = signal<Cliente[]>([]);
  readonly modalExclusaoVisible = signal(false);
  readonly clienteParaExcluir = signal<Cliente | null>(null);

  // Formulário reativo
  readonly filtrosForm = this.fb.group({
    nome: [''],
    cidade: ['']
  });

  // Signal derivado dos filtros do formulário (com debounce)
  private readonly filtrosSignal = toSignal(
    this.filtrosForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ),
    { initialValue: this.filtrosForm.getRawValue() }
  );

  // Computed signals
  readonly paginatorState = computed(() => {
    const first = this.paginaAtual();
    const rows = this.registrosPorPagina();
    return {
      first,
      rows,
      page: Math.floor(first / rows),
      pageCount: Math.ceil(this.clientes().length / rows)
    };
  });

  readonly totalRegistrosFiltrados = signal(0);

  readonly contagemTotal = signal(0);
  readonly contagemAtivos = signal(0);
  readonly contagemInativos = signal(0);

  readonly carregando$ = this.loadingService.carregando;

  readonly listaVaziaSemFiltros = computed(() => {
    const valores = this.filtrosForm.getRawValue();
    return !valores.nome && !valores.cidade;
  });

  readonly nenhumClienteCadastrado = computed(() =>
    this.contagemTotal() === 0
  );

  readonly modoReativacao = computed(() =>
    this.filtroStatus() === 'inativos'
  );

  readonly skeletonArray = computed(() =>
    Array(this.registrosPorPagina()).fill(0)
  );

  // Effects para reações automáticas
  constructor() {
    const snapshotParams = this.route.snapshot.queryParams;
    const hasUrlState = this.hasAnyQueryParam(snapshotParams);
    const storedParams = this.getStoredQueryParams();
    const initialParams = hasUrlState ? snapshotParams : storedParams ?? {};

    const pagina = Number(initialParams['pagina'] ?? 0);
    const limite = Number(initialParams['limite'] ?? 10);
    const statusParam = (initialParams['status'] as 'ativos' | 'inativos' | 'todos') ?? 'ativos';

    this.paginaAtual.set(!isNaN(pagina) && pagina >= 0 ? pagina : 0);
    this.registrosPorPagina.set(!isNaN(limite) && limite > 0 ? limite : 10);
    this.filtroStatus.set(statusParam);

    this.filtrosForm.setValue(
      {
        nome: initialParams['nome'] ?? '',
        cidade: initialParams['cidade'] ?? ''
      },
      { emitEvent: true }
    );

    if (!hasUrlState && storedParams) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: storedParams,
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }

    // 2) Atualizar query params sempre que o estado mudar
    effect(() => {
      const pagina = this.paginaAtual();
      const limite = this.registrosPorPagina();
      const status = this.filtroStatus();
      const filtros = this.filtrosSignal();

      const queryParams: Record<string, any> = {
        pagina,
        limite: limite !== 10 ? limite : undefined,
        status: status !== 'ativos' ? status : undefined,
        nome: filtros?.nome || undefined,
        cidade: filtros?.cidade || undefined
      };

      this.setStoredQueryParams({
        pagina,
        limite,
        status,
        nome: filtros?.nome || '',
        cidade: filtros?.cidade || ''
      });

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge'
      });
    }, { allowSignalWrites: true });

    // 3) Buscar clientes sempre que filtros, página, limite ou status mudarem
    effect(async () => {
      const pagina = this.paginaAtual();
      const limite = this.registrosPorPagina();
      const status = this.filtroStatus();
      const filtros = this.filtrosSignal();

      await this.buscarClientes({
        nome: filtros?.nome || undefined,
        cidade: filtros?.cidade || undefined,
        status,
        pagina: Math.floor(pagina / limite),
        limite
      });

      await this.buscarContagensTotais();
    }, { allowSignalWrites: true });
  }

  private hasAnyQueryParam(params: Record<string, any>): boolean {
    if (!params) return false;
    return ['pagina', 'limite', 'status', 'nome', 'cidade'].some(
      key => params[key] !== undefined && params[key] !== null && params[key] !== ''
    );
  }

  private getStoredQueryParams(): Record<string, any> | null {
    try {
      if (typeof window === 'undefined') return null;
      const raw = window.sessionStorage.getItem(CLIENTES_QUERY_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private setStoredQueryParams(params: Record<string, any>): void {
    try {
      if (typeof window === 'undefined') return;
      window.sessionStorage.setItem(CLIENTES_QUERY_STORAGE_KEY, JSON.stringify(params));
    } catch {
      // ignore storage errors
    }
  }

  // Métodos públicos da store
  async buscarClientes(filtrosParciais?: {
    nome?: string;
    cidade?: string;
    status?: 'todos' | 'ativos' | 'inativos';
    pagina?: number;
    limite?: number;
  }): Promise<void> {
    try {
      const filtros = filtrosParciais ?? {
        nome: this.filtrosForm.value.nome || undefined,
        cidade: this.filtrosForm.value.cidade || undefined,
        status: this.filtroStatus(),
        pagina: Math.floor(this.paginaAtual() / this.registrosPorPagina()),
        limite: this.registrosPorPagina()
      };

      const resultado = await firstValueFrom(
        this.clienteService.buscarComFiltros(filtros)
      );

      this.clientes.set(resultado.clientes);
      this.totalRegistrosFiltrados.set(resultado.total);

    } catch (erro) {
      console.error('Erro ao carregar clientes', erro);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar clientes'
      });
    }
  }

  async buscarContagensTotais(): Promise<void> {
    try {
      // Buscar todos os registros filtrados (sem paginação) para contar
      const filtros = {
        nome: this.filtrosForm.value.nome || undefined,
        cidade: this.filtrosForm.value.cidade || undefined,
        status: 'todos' as const, // Sempre buscar todos para contar ativos/inativos
        pagina: undefined, // Sem paginação para obter todos os registros filtrados
        limite: undefined
      };

      const resultado = await firstValueFrom(
        this.clienteService.buscarComFiltros(filtros)
      );

      // Contar baseado nos registros filtrados
      this.contagemTotal.set(resultado.total);
      this.contagemAtivos.set(resultado.clientes.filter(c => c.ativo === true).length);
      this.contagemInativos.set(resultado.clientes.filter(c => c.ativo === false).length);

    } catch (erro) {
      console.error('Erro ao buscar contagens totais', erro);
      this.contagemTotal.set(0);
      this.contagemAtivos.set(0);
      this.contagemInativos.set(0);
    }
  }

  async aplicarFiltros(): Promise<void> {
    this.paginaAtual.set(0);
  }

  async filtrarPorStatus(status: 'ativos' | 'inativos' | 'todos'): Promise<void> {
    this.filtroStatus.set(status);
    this.clientesSelecionados.set([]);
    this.paginaAtual.set(0);
  }

  onMudancaPagina(event: any): void {
    this.paginaAtual.set(event.first);
    this.registrosPorPagina.set(event.rows);
  }

  async executarExclusaoEmMassa(): Promise<void> {
    if (this.clientesSelecionados().length === 0) return;

    if (this.modoReativacao()) {
      await this._reativarClientes();
    } else {
      await this._desativarClientes();
    }
  }

  private async _reativarClientes(): Promise<void> {
    try {
      const promises = this.clientesSelecionados().map(cliente =>
        firstValueFrom(this.clienteService.atualizar(cliente.id, { ativo: true }))
      );

      await Promise.all(promises);

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `${this.clientesSelecionados().length} cliente(s) reativado(s) com sucesso`
      });

      this.clientesSelecionados.set([]);
      await this.buscarClientes();
      await this.buscarContagensTotais();
      this.modalExclusaoVisible.set(false);

    } catch (erro) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao reativar clientes selecionados'
      });
    }
  }

  private async _desativarClientes(): Promise<void> {
    try {
      const promises = this.clientesSelecionados().map(cliente =>
        firstValueFrom(this.clienteService.excluir(cliente.id))
      );

      await Promise.all(promises);

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `${this.clientesSelecionados().length} cliente(s) marcado(s) como inativo(s) com sucesso`
      });

      this.clientesSelecionados.set([]);
      await this.buscarClientes();
      await this.buscarContagensTotais();
      this.modalExclusaoVisible.set(false);

    } catch (erro) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao inativar clientes selecionados'
      });
    }
  }

  limparFiltros(): void {
    this.filtrosForm.reset({
      nome: '',
      cidade: ''
    });
    this.clientesSelecionados.set([]);
  }

  onLinhaClienteClick(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.id]);
  }

  editarCliente(cliente: Cliente): void {
    this.router.navigate(['/clientes', cliente.id, 'editar']);
  }

  confirmarExclusao(cliente: Cliente): void {
    this.clienteParaExcluir.set(cliente);
    this.modalExclusaoVisible.set(true);
  }

  async executarExclusao(): Promise<void> {
    const cliente = this.clienteParaExcluir();
    if (!cliente) return;

    try {
      await firstValueFrom(this.clienteService.excluir(cliente.id));

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Cliente marcado como inativo com sucesso'
      });

      await this.buscarClientes();
      this.modalExclusaoVisible.set(false);
      this.clienteParaExcluir.set(null);

    } catch (erro) {
      console.error('Erro ao inativar cliente', erro);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao inativar cliente'
      });
    }
  }

  cancelarExclusao(): void {
    this.modalExclusaoVisible.set(false);
    this.clienteParaExcluir.set(null);
    this.clientesSelecionados.set([]);
  }

  novoCliente(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Em desenvolvimento',
      detail: 'Cadastro de novo cliente será implementado em breve'
    });
  }

  async inserirClientesTeste(): Promise<void> {
    this.messageService.add({
      severity: 'info',
      summary: 'Em desenvolvimento',
      detail: 'Inserção de clientes de teste será implementada em breve'
    });
  }
}
