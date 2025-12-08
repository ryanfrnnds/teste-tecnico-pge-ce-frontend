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

import { Injectable, computed, signal, effect, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { firstValueFrom, debounceTime, distinctUntilChanged, take } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);

  readonly clientes = signal<Cliente[]>([]);
  readonly paginaAtual = signal(0);
  readonly registrosPorPagina = signal(10);
  readonly filtroStatus = signal<'ativos' | 'inativos' | 'todos'>('ativos');
  readonly clientesSelecionados = signal<Cliente[]>([]);
  readonly modalConfirmacaoVisible = signal(false);
  readonly clienteParaAlterar = signal<Cliente | null>(null);

  readonly filtrosForm = this.fb.group({
    nome: [''],
    cidade: ['']
  });

  readonly filtrosSignal = signal<{ nome: string; cidade: string }>({
    nome: '',
    cidade: ''
  });

  private primeiraExecucao = true;
  private buscaManualEmAndamento = false;
  private ultimaExecucaoEffect: { pagina: number; limite: number; status: string; nome: string; cidade: string } | null = null;

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
    this.filtrosForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => {
        const prevNome = (prev?.nome || '').trim();
        const prevCidade = (prev?.cidade || '').trim();
        const currNome = (curr?.nome || '').trim();
        const currCidade = (curr?.cidade || '').trim();
        return prevNome === currNome && prevCidade === currCidade;
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(valores => {
      this.filtrosSignal.set({
        nome: valores.nome || '',
        cidade: valores.cidade || ''
      });
    });

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
      { emitEvent: false }
    );

    this.filtrosSignal.set(this.filtrosForm.getRawValue());

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

    Promise.resolve().then(() => {
      this.loadingService.iniciar();
      this.buscarDadosIniciais().finally(() => {
        this.loadingService.finalizar();
        this.primeiraExecucao = false;
      });
    });

    effect(async () => {
      if (this.primeiraExecucao || this.buscaManualEmAndamento) {
        return;
      }

      const pagina = this.paginaAtual();
      const limite = this.registrosPorPagina();
      const status = this.filtroStatus();
      const filtros = this.filtrosSignal();

      const nomeFiltro = (filtros?.nome?.trim() || '');
      const cidadeFiltro = (filtros?.cidade?.trim() || '');

      const execucaoAtual = { pagina, limite, status, nome: nomeFiltro, cidade: cidadeFiltro };
      if (this.ultimaExecucaoEffect && 
          this.ultimaExecucaoEffect.pagina === execucaoAtual.pagina &&
          this.ultimaExecucaoEffect.limite === execucaoAtual.limite &&
          this.ultimaExecucaoEffect.status === execucaoAtual.status &&
          this.ultimaExecucaoEffect.nome === execucaoAtual.nome &&
          this.ultimaExecucaoEffect.cidade === execucaoAtual.cidade) {
        return;
      }

      const mudouFiltros = !this.ultimaExecucaoEffect || (
        this.ultimaExecucaoEffect.nome !== nomeFiltro || 
        this.ultimaExecucaoEffect.cidade !== cidadeFiltro ||
        this.ultimaExecucaoEffect.status !== status
      );
      
      this.ultimaExecucaoEffect = execucaoAtual;

      this.loadingService.iniciar();
      try {
        await this.buscarClientes({
          nome: nomeFiltro || undefined,
          cidade: cidadeFiltro || undefined,
          status,
          pagina: Math.floor(pagina / limite),
          limite
        });
        
        if (mudouFiltros) {
          await Promise.all([
            this.buscarContagensTotais(),
            this.buscarTotalGeralSistema()
          ]);
        }
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

  /**
   * Busca todos os dados iniciais de forma otimizada
   * Faz apenas 2 chamadas: uma para clientes paginados e outra para contagens/total
   */
  private async buscarDadosIniciais(): Promise<void> {
    try {
      const nomeFiltro = this.filtrosForm.value.nome || undefined;
      const cidadeFiltro = this.filtrosForm.value.cidade || undefined;
      const status = this.filtroStatus();
      const pagina = Math.floor(this.paginaAtual() / this.registrosPorPagina());
      const limite = this.registrosPorPagina();

      const resultadoClientes = await firstValueFrom(
        this.clienteService.buscarComFiltros({
          nome: nomeFiltro,
          cidade: cidadeFiltro,
          status,
          pagina,
          limite
        })
      );

      this.clientes.set(resultadoClientes.clientes);
      this.totalRegistrosFiltrados.set(resultadoClientes.total);

      if (nomeFiltro || cidadeFiltro) {
        const [totalGeral, resultadoContagens] = await Promise.all([
          firstValueFrom(this.clienteService.contarTotalGeral()),
          firstValueFrom(
            this.clienteService.buscarComFiltros({
              nome: nomeFiltro,
              cidade: cidadeFiltro,
              status: 'todos',
              pagina: undefined,
              limite: undefined
            })
          )
        ]);
        this.totalGeralSistema.set(totalGeral);
        this.contagemTotal.set(resultadoContagens.clientes.length);
        this.contagemAtivos.set(resultadoContagens.clientes.filter(c => c.ativo === true).length);
        this.contagemInativos.set(resultadoContagens.clientes.filter(c => c.ativo === false).length);
      } else {
        const resultadoTodos = await firstValueFrom(
          this.clienteService.buscarComFiltros({
            status: 'todos',
            pagina: undefined,
            limite: undefined
          })
        );
        this.totalGeralSistema.set(resultadoTodos.total);
        this.contagemTotal.set(resultadoTodos.clientes.length);
        this.contagemAtivos.set(resultadoTodos.clientes.filter(c => c.ativo === true).length);
        this.contagemInativos.set(resultadoTodos.clientes.filter(c => c.ativo === false).length);
      }

    } catch (erro) {
      console.error('Erro ao carregar dados iniciais', erro);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao carregar dados'
      });
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


  async filtrarPorStatus(status: 'ativos' | 'inativos' | 'todos'): Promise<void> {
    this.buscaManualEmAndamento = true;
    this.filtroStatus.set(status);
    this.clientesSelecionados.set([]);
    this.paginaAtual.set(0);
    
    const filtros = this.filtrosSignal();
    const nomeFiltro = (filtros?.nome?.trim() || '');
    const cidadeFiltro = (filtros?.cidade?.trim() || '');
    this.ultimaExecucaoEffect = { pagina: 0, limite: this.registrosPorPagina(), status, nome: nomeFiltro, cidade: cidadeFiltro };
    
    this.loadingService.iniciar();
    try {
      await this.buscarClientes({
        nome: nomeFiltro || undefined,
        cidade: cidadeFiltro || undefined,
        status,
        pagina: 0,
        limite: this.registrosPorPagina()
      });
      
      await Promise.all([
        this.buscarContagensTotais(),
        this.buscarTotalGeralSistema()
      ]);
    } finally {
      this.loadingService.finalizar();
      this.buscaManualEmAndamento = false;
    }
  }

  async onMudancaPagina(event: any): Promise<void> {
    const novaPagina = event.first;
    const novoLimite = event.rows;
    
    this.buscaManualEmAndamento = true;
    this.paginaAtual.set(novaPagina);
    this.registrosPorPagina.set(novoLimite);
    
    const filtros = this.filtrosSignal();
    const nomeFiltro = (filtros?.nome?.trim() || '');
    const cidadeFiltro = (filtros?.cidade?.trim() || '');
    this.ultimaExecucaoEffect = { 
      pagina: novaPagina, 
      limite: novoLimite, 
      status: this.filtroStatus(), 
      nome: nomeFiltro, 
      cidade: cidadeFiltro 
    };
    
    this.loadingService.iniciar();
    try {
      await this.buscarClientes({
        nome: nomeFiltro || undefined,
        cidade: cidadeFiltro || undefined,
        status: this.filtroStatus(),
        pagina: Math.floor(novaPagina / novoLimite),
        limite: novoLimite
      });
    } finally {
      this.loadingService.finalizar();
      this.buscaManualEmAndamento = false;
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

  abrirModalAlteracaoStatus(cliente: Cliente): void {
    if (!cliente) return;
    this.clienteParaAlterar.set(cliente);
    this.modalConfirmacaoVisible.set(true);
  }

  abrirModalAlteracaoStatusEmMassa(): void {
    if (this.clientesSelecionados().length === 0) return;
    this.clienteParaAlterar.set(null);
    this.modalConfirmacaoVisible.set(true);
  }

  async executarAlteracaoStatus(): Promise<void> {
    const cliente = this.clienteParaAlterar();
    
    if (cliente) {
      await this._alterarStatusCliente(cliente);
    } else {
      await this._alterarStatusEmMassa();
    }
  }

  cancelarAlteracaoStatus(): void {
    this.modalConfirmacaoVisible.set(false);
    this.clienteParaAlterar.set(null);
  }

  private async _alterarStatusCliente(cliente: Cliente): Promise<void> {
    const novoStatus = !cliente.ativo;
    const acao = novoStatus ? 'reativar' : 'inativar';

    try {
      await firstValueFrom(this.clienteService.atualizar(cliente.id, { ativo: novoStatus }));

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Cliente "${cliente.nome}" ${novoStatus ? 'reativado' : 'inativado'} com sucesso`
      });

      await this._atualizarListaAposOperacao();
      this.cancelarAlteracaoStatus();

    } catch (erro) {
      console.error(`Erro ao ${acao} cliente`, erro);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: `Erro ao ${acao} cliente "${cliente.nome}"`
      });
      this.cancelarAlteracaoStatus();
    }
  }

  private async _alterarStatusEmMassa(): Promise<void> {
    const clientes = this.clientesSelecionados();
    if (clientes.length === 0) {
      this.cancelarAlteracaoStatus();
      return;
    }

    const isReativacao = this.modoReativacao();
    const acao = isReativacao ? 'reativar' : 'inativar';

    try {
      if (isReativacao) {
        const promises = clientes.map(cliente =>
          firstValueFrom(this.clienteService.atualizar(cliente.id, { ativo: true }))
        );
        await Promise.all(promises);
      } else {
        await firstValueFrom(this.clienteService.inativarEmLote(clientes));
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `${clientes.length} cliente(s) ${isReativacao ? 'reativado(s)' : 'inativado(s)'} com sucesso`
      });

      this.clientesSelecionados.set([]);
      await this._atualizarListaAposOperacao();
      this.cancelarAlteracaoStatus();

    } catch (erro) {
      console.error(`Erro ao ${acao} clientes em massa`, erro);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: `Erro ao ${acao} clientes selecionados`
      });
      this.cancelarAlteracaoStatus();
    }
  }

  private async _atualizarListaAposOperacao(): Promise<void> {
    this.buscaManualEmAndamento = true;
    
    const filtros = this.filtrosSignal();
    const nomeFiltro = (filtros?.nome?.trim() || '');
    const cidadeFiltro = (filtros?.cidade?.trim() || '');
    const pagina = this.paginaAtual();
    const limite = this.registrosPorPagina();
    const status = this.filtroStatus();
    
    this.ultimaExecucaoEffect = { pagina, limite, status, nome: nomeFiltro, cidade: cidadeFiltro };
    
    await Promise.all([
      this.buscarClientes({
        nome: nomeFiltro || undefined,
        cidade: cidadeFiltro || undefined,
        status,
        pagina: Math.floor(pagina / limite),
        limite
      }),
      this.buscarContagensTotais(),
      this.buscarTotalGeralSistema()
    ]);
    
    this.buscaManualEmAndamento = false;
  }

  novoCliente(): void {
    this.router.navigate(['/clientes/novo']);
  }

}
