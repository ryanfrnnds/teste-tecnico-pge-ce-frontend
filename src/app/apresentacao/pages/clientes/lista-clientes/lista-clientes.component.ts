import { Component, inject, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
import { MaskCpfPipe } from '@apresentacao/pipes/mask-cpf.pipe';
import { MaskEmailPipe } from '@apresentacao/pipes/mask-email.pipe';
import { MaskPhonePipe } from '@apresentacao/pipes/mask-phone.pipe';
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
    MaskCpfPipe,
    MaskEmailPipe,
    MaskPhonePipe
  ],
  providers: [ListaClientesStore],
  templateUrl: './lista-clientes.component.html',
  styleUrl: './lista-clientes.component.scss'
})
export class ListaClientesComponent {
  readonly ambienteDesenvolvimento = isDevMode();

  private readonly store = inject(ListaClientesStore);

  readonly clientes = this.store.clientes;
  readonly filtrosForm = this.store.filtrosForm;
  readonly paginatorState = this.store.paginatorState;
  readonly totalRegistrosFiltrados = this.store.totalRegistrosFiltrados;
  readonly carregando$ = this.store.carregando$;
  readonly filtroStatus = this.store.filtroStatus;
  readonly clientesSelecionados = this.store.clientesSelecionados;
  readonly modalExclusaoVisible = this.store.modalExclusaoVisible;
  readonly clienteParaExcluir = this.store.clienteParaExcluir;
  readonly contagemTotal = this.store.contagemTotal;
  readonly contagemAtivos = this.store.contagemAtivos;
  readonly contagemInativos = this.store.contagemInativos;
  readonly listaVaziaSemFiltros = this.store.listaVaziaSemFiltros;
  readonly nenhumClienteCadastrado = this.store.nenhumClienteCadastrado;
  readonly modoReativacao = this.store.modoReativacao;
  readonly skeletonArray = this.store.skeletonArray;

  limparCampo(campo: 'nome' | 'cidade'): void {
    const control = this.filtrosForm.get(campo);
    if (control) {
      control.setValue('');
    }
  }

  get modalExclusaoVisibleModel(): boolean {
    return this.modalExclusaoVisible();
  }

  set modalExclusaoVisibleModel(value: boolean) {
    this.modalExclusaoVisible.set(value);
  }

  get clientesSelecionadosModel(): Cliente[] {
    return this.clientesSelecionados();
  }

  set clientesSelecionadosModel(value: Cliente[]) {
    this.clientesSelecionados.set(value);
  }

  constructor() {}

  aoPesquisar(): void {
    this.store.aplicarFiltros();
  }

  aplicarFiltros(): void {
    this.store.aplicarFiltros();
  }

  filtrarPorStatus(status: 'ativos' | 'inativos' | 'todos'): void {
    this.store.filtrarPorStatus(status);
  }

  onMudancaPagina(event: any): void {
    this.store.onMudancaPagina(event);
  }

  onLinhaClienteClick(cliente: any): void {
    this.store.onLinhaClienteClick(cliente);
  }

  editarCliente(cliente: any): void {
    this.store.editarCliente(cliente);
  }

  confirmarAlteracaoStatus(cliente: any): void {
    this.store.confirmarAlteracaoStatus(cliente);
  }

  executarAlteracaoStatus(): void {
    this.store.executarAlteracaoStatus();
  }

  cancelarExclusao(): void {
    this.store.cancelarExclusao();
  }

  confirmarExclusaoEmMassa(): void {
    this.store.executarExclusaoEmMassa();
  }

  executarExclusaoEmMassa(): void {
    this.store.executarExclusaoEmMassa();
  }

  limparFiltros(): void {
    this.store.limparFiltros();
  }

  novoCliente(): void {
    this.store.novoCliente();
  }

  inserirClientesTeste(): void {
    this.store.inserirClientesTeste();
  }
}
