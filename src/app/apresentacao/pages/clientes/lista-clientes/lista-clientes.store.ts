/**
 * @description
 * `ListaClientesStore` é o *Store* responsável por gerenciar todo o estado
 * e o comportamento da tela de listagem de clientes.
 *
 * ## 📦 O que é o STORE aqui?
 * Este Store centraliza:
 * - Estados de listagem: clientes, paginação, filtros, seleção, status.
 * - Regras de interação da UI: mudar página, aplicar filtros, limpar filtros,
 *   ativar/inativar em massa, navegar para edição/novo cliente.
 * - Sincronização de estado com a URL (query params) e sessionStorage,
 *   permitindo que o usuário volte ao mesmo estado ao recarregar a página
 *   ou navegar de/para a tela.
 * - Coordenação de chamadas para serviços (ClienteService, LoadingService)
 *   e exibição de mensagens de feedback (MessageService).
 *
 * O componente de UI consome apenas os signals/computed e chama métodos
 * públicos desse Store, mantendo o component mais simples e declarativo.
 *
 * ## 📄 O que são os STATES aqui?
 * Nesta classe, **states** são:
 * - Signals de dados: `clientes`, `paginaAtual`, `registrosPorPagina`,
 *   `filtroStatus`, `clientesSelecionados`, `modalExclusaoVisible`,
 *   `clienteParaExcluir`, `totalRegistrosFiltrados`, `contagemTotal`,
 *   `contagemAtivos`, `contagemInativos`, `totalGeralSistema`.
 * - Signals derivados (`computed`): `paginatorState`, `listaVaziaSemFiltros`,
 *   `nenhumClienteCadastrado`, `modoReativacao`, `skeletonArray`.
 * - Estados de formulário: `filtrosForm` (Reactive Form) e o `filtrosSignal`
 *   derivado de `valueChanges`.
 * - Estado reativo de carregamento: `carregando$`, exposto pelo `LoadingService`.
 *
 * Esses states representam o *estado atual da tela de lista* e são
 * atualizados pelos métodos do Store. A UI reage automaticamente às mudanças.
 *
 * ## 🧩 Resumo
 * - O Store: classe `ListaClientesStore` como container de estado + lógica da tela.
 * - Os States: todos os signals/computed, o formulário reativo e o stream
 *   de carregamento que descrevem como a tela está em cada momento.
 */

import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { firstValueFrom, debounceTime, distinctUntilChanged } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Cliente } from '@dominio/models/cliente.model';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LoadingService } from '@infraestrutura/services/loading.service';

const CLIENTES_QUERY_STORAGE_KEY = 'lista-clientes-query-params';

@Injectable()
export class ListaClientesStore {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly loadingService = inject(LoadingService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly clientes = signal<Cliente[]>([]);
  readonly paginaAtual = signal(0);
  readonly registrosPorPagina = signal(10);
  readonly filtroStatus = signal<'ativos' | 'inativos' | 'todos'>('ativos');
  readonly clientesSelecionados = signal<Cliente[]>([]);
  readonly modalExclusaoVisible = signal(false);
  readonly clienteParaExcluir = signal<Cliente | null>(null);

  readonly filtrosForm = this.fb.group({
    nome: [''],
    cidade: ['']
  });

  private readonly filtrosSignal = toSignal(
    this.filtrosForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ),
    { initialValue: this.filtrosForm.getRawValue() }
  );

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

  readonly totalGeralSistema = signal(0);

  readonly carregando$ = this.loadingService.carregando;

  readonly listaVaziaSemFiltros = computed(() => {
    const valores = this.filtrosForm.getRawValue();
    return !valores.nome && !valores.cidade;
  });

  readonly nenhumClienteCadastrado = computed(() =>
    this.totalGeralSistema() === 0
  );

  readonly modoReativacao = computed(() =>
    this.filtroStatus() === 'inativos'
  );

  readonly skeletonArray = computed(() =>
    Array(this.registrosPorPagina()).fill(0)
  );

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

    effect(async () => {
      const pagina = this.paginaAtual();
      const limite = this.registrosPorPagina();
      const status = this.filtroStatus();
      const filtros = this.filtrosSignal();

      this.loadingService.iniciar();
      try {
        await this.buscarClientes({
          nome: filtros?.nome || undefined,
          cidade: filtros?.cidade || undefined,
          status,
          pagina: Math.floor(pagina / limite),
          limite
        });
        await this.buscarContagensTotais();
        await this.buscarTotalGeralSistema();
      } finally {
        this.loadingService.finalizar();
      }
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
    }
  }

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
      const filtros = {
        nome: this.filtrosForm.value.nome || undefined,
        cidade: this.filtrosForm.value.cidade || undefined,
        status: 'todos' as const,
        pagina: undefined,
        limite: undefined
      };

      const resultado = await firstValueFrom(
        this.clienteService.buscarComFiltros(filtros)
      );

      this.contagemTotal.set(resultado.clientes.length);
      this.contagemAtivos.set(resultado.clientes.filter(c => c.ativo === true).length);
      this.contagemInativos.set(resultado.clientes.filter(c => c.ativo === false).length);

    } catch (erro) {
      console.error('Erro ao buscar contagens totais', erro);
      this.contagemTotal.set(0);
      this.contagemAtivos.set(0);
      this.contagemInativos.set(0);
    }
  }

  async buscarTotalGeralSistema(): Promise<void> {
    try {
      const total = await firstValueFrom(this.clienteService.contarTotalGeral());
      this.totalGeralSistema.set(total);
    } catch (erro) {
      console.error('Erro ao buscar total geral do sistema', erro);
      this.totalGeralSistema.set(0);
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
      await this.buscarTotalGeralSistema();
      this.modalExclusaoVisible.set(false);

    } catch {
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
      await this.buscarTotalGeralSistema();
      this.modalExclusaoVisible.set(false);

    } catch {
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

  confirmarAlteracaoStatus(cliente: Cliente): void {
    this.clienteParaExcluir.set(cliente);
    this.modalExclusaoVisible.set(true);
  }

  async executarAlteracaoStatus(): Promise<void> {
    const cliente = this.clienteParaExcluir();
    if (!cliente) return;

    const novoStatusAtivo = !cliente.ativo;
    const acao = novoStatusAtivo ? 'reativar' : 'inativar';

    try {
      if (novoStatusAtivo) {
        await firstValueFrom(this.clienteService.atualizar(cliente.id, { ativo: true }));
      } else {
        await firstValueFrom(this.clienteService.excluir(cliente.id));
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Cliente ${novoStatusAtivo ? 'reativado' : 'inativado'} com sucesso`
      });

      await this.buscarClientes();
      await this.buscarContagensTotais();
      this.modalExclusaoVisible.set(false);
      this.clienteParaExcluir.set(null);
      await this.buscarTotalGeralSistema();

    } catch (erro) {
      console.error(`Erro ao ${acao} cliente`, erro);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: `Erro ao ${acao} cliente`
      });
    }
  }

  cancelarExclusao(): void {
    this.modalExclusaoVisible.set(false);
    this.clienteParaExcluir.set(null);
    this.clientesSelecionados.set([]);
  }

  novoCliente(): void {
    this.router.navigate(['/clientes/novo']);
  }

  async inserirClientesTeste(): Promise<void> {
    this.loadingService.iniciar();
    try {
      await firstValueFrom(this.clienteService.popularMockClientes());
      await this.buscarClientes();
      await this.buscarContagensTotais();
      await this.buscarTotalGeralSistema();
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Clientes de teste inseridos com sucesso'
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao inserir clientes de teste'
      });
    } finally {
      this.loadingService.finalizar();
    }
  }
}
