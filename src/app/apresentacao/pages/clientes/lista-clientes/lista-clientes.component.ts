import { Component, inject, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ConfirmModalComponent } from '@apresentacao/components/confirm-modal/confirm-modal.component';
import { ListaPageContainerComponent } from '@apresentacao/components/lista-page-container/lista-page-container.component';
import { ListaPageTableWrapperComponent } from '@apresentacao/components/lista-page-container/lista-page-container-table-wrapper.component';
import { MaskCpfPipe } from '@apresentacao/pipes/mask-cpf.pipe';
import { MaskEmailPipe } from '@apresentacao/pipes/mask-email.pipe';
import { MaskPhonePipe } from '@apresentacao/pipes/mask-phone.pipe';
import { GlobalPaginatorService } from '@infraestrutura/services/global-paginator.service';
import { ListaClientesStore } from './lista-clientes.store';
import { Cliente } from '@dominio/models/cliente.model';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    TagModule,
    InputTextModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    SelectButtonModule,
    SkeletonModule,
    TooltipModule,
    FloatLabelModule,
    ConfirmModalComponent,
    ListaPageContainerComponent,
    ListaPageTableWrapperComponent,
    MaskCpfPipe,
    MaskEmailPipe,
    MaskPhonePipe
  ],
  providers: [ListaClientesStore],
  templateUrl: './lista-clientes.component.html',
  styleUrl: './lista-clientes.component.scss'
})
export class ListaClientesComponent implements OnInit, OnDestroy {
  private readonly store = inject(ListaClientesStore);
  private readonly globalPaginatorService = inject(GlobalPaginatorService);
  private readonly router = inject(Router);

  readonly clientes = this.store.clientes;
  readonly filtrosForm = this.store.filtrosForm;
  readonly paginatorState = this.store.paginatorState;
  readonly totalRegistrosFiltrados = this.store.totalRegistrosFiltrados;
  readonly carregando$ = this.store.carregando$;
  readonly filtroStatus = this.store.filtroStatus;
  readonly clientesSelecionados = this.store.clientesSelecionados;
  readonly modalConfirmacaoVisible = this.store.modalConfirmacaoVisible;
  readonly clienteParaAlterar = this.store.clienteParaAlterar;
  readonly contagemTotal = this.store.contagemTotal;
  readonly contagemAtivos = this.store.contagemAtivos;
  readonly contagemInativos = this.store.contagemInativos;
  readonly listaVaziaSemFiltros = this.store.listaVaziaSemFiltros;
  readonly nenhumClienteCadastrado = this.store.nenhumClienteCadastrado;
  readonly modoReativacao = this.store.modoReativacao;
  readonly skeletonArray = this.store.skeletonArray;

  /**
   * Retorna um array de objetos vazios para exibir skeleton quando carregando
   */
  getSkeletonArray(): any[] {
    return Array(this.paginatorState().rows).fill({});
  }

  limparCampo(campo: 'nome' | 'cidade'): void {
    const control = this.filtrosForm.get(campo);
    if (control) {
      control.setValue('');
    }
  }

  constructor() {
    effect(() => {
      const state = this.paginatorState();
      const total = this.totalRegistrosFiltrados();
      
      if (state && total !== undefined) {
        this.globalPaginatorService.setPaginatorState(
          {
            rows: state.rows,
            first: state.first,
            totalRecords: total,
            rowsPerPageOptions: [10, 20, 50],
            showFirstLastIcon: true
          },
          (event) => this.onMudancaPagina(event)
        );
      }
    });
  }

  ngOnInit(): void {
    const state = this.paginatorState();
    const total = this.totalRegistrosFiltrados();
    
    if (state && total !== undefined) {
      this.globalPaginatorService.setPaginatorState(
        {
          rows: state.rows,
          first: state.first,
          totalRecords: total,
          rowsPerPageOptions: [10, 20, 50],
          showFirstLastIcon: true
        },
        (event) => this.onMudancaPagina(event)
      );
    }

    let ultimaUrl = this.router.url;
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      filter(event => {
        const urlAtual = event.urlAfterRedirects;
        const isClientesRoute = urlAtual === '/clientes' || urlAtual.startsWith('/clientes?');
        const mudouRota = urlAtual !== ultimaUrl;
        ultimaUrl = urlAtual;
        return isClientesRoute && mudouRota;
      })
    ).subscribe(() => {
      const filtros = this.store.filtrosSignal();
      const status = this.store.filtroStatus();
      
      this.store.filtrosSignal.set({ ...filtros });
      this.store.filtroStatus.set(status);
    });
  }

  ngOnDestroy(): void {
    this.globalPaginatorService.clearPaginatorState();
  }


  async filtrarPorStatus(status: 'ativos' | 'inativos' | 'todos'): Promise<void> {
    await this.store.filtrarPorStatus(status);
  }

  async onMudancaPagina(event: any): Promise<void> {
    await this.store.onMudancaPagina(event);
  }

  onLinhaClienteClick(cliente: any): void {
    this.store.onLinhaClienteClick(cliente);
  }

  editarCliente(cliente: any): void {
    this.store.editarCliente(cliente);
  }

  abrirModalAlteracaoStatus(cliente: Cliente): void {
    this.store.abrirModalAlteracaoStatus(cliente);
  }

  abrirModalAlteracaoStatusEmMassa(): void {
    this.store.abrirModalAlteracaoStatusEmMassa();
  }

  async executarAlteracaoStatus(): Promise<void> {
    await this.store.executarAlteracaoStatus();
  }

  cancelarAlteracaoStatus(): void {
    this.store.cancelarAlteracaoStatus();
  }

  limparFiltros(): void {
    this.store.limparFiltros();
  }

  novoCliente(): void {
    this.store.novoCliente();
  }

}
