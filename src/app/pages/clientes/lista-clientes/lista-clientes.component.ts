import { Component, OnInit, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, NonNullableFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';

import { Cliente } from '@core/models/cliente.model';
import { ClienteService } from '@core/services/cliente.service';
import { LogService } from '@core/services/log.service';
import { LoadingService } from '@core/services/loading.service';
import { forkJoin } from 'rxjs';
import { ConfirmModalComponent } from '@core/components/confirm-modal/confirm-modal.component';
import { CpfFormatDirective } from '@core/directives/cpf-format.directive';
import { TelefoneFormatDirective } from '@core/directives/telefone-format.directive';
import { ClienteStatusEnum } from '@core/enum/cliente-status.enum';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    SelectModule,
    SkeletonModule,
    TooltipModule,
    FloatLabelModule,
    ConfirmModalComponent,
    CpfFormatDirective,
    TelefoneFormatDirective
  ],
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.scss']
})
export class ListaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  readonly ambienteDesenvolvimento = isDevMode();
  readonly clienteStatusEnum = ClienteStatusEnum;

  paginaAtual: number = 0;
  registrosPorPagina: number = 10;
  totalRegistrosFiltrados: number = 0;

  carregando$ = this.loadingService.carregando;

  filtroStatus: string = 'todos';
  opcoesStatus: any[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativos', value: 'ativos' },
    { label: 'Inativos', value: 'inativos' }
  ];

  filtroNome: string | null = null;
  filtroCpf: string | null = null;
  filtroEmail: string | null = null;
  filtroTelefone: string | null = null;

  opcoesFiltroNome: { label: string; value: string }[] = [];
  opcoesFiltroCpf: { label: string; value: string }[] = [];
  opcoesFiltroEmail: { label: string; value: string }[] = [];
  opcoesFiltroTelefone: { label: string; value: string }[] = [];

  modalExclusaoVisible: boolean = false;
  clienteParaExcluir: Cliente | null = null;

  filtrosForm = this.fb.group({
    nome: [''],
    cpf: [''],
    email: [''],
    telefone: [''],
    status: ['todos']
  });

  get listaVaziaSemFiltros(): boolean {
    const valores = this.filtrosForm.getRawValue();
    return !valores.nome && !valores.cpf && !valores.email && !valores.telefone && valores.status === 'todos';
  }

  constructor(
    private clienteService: ClienteService,
    private logService: LogService,
    private loadingService: LoadingService,
    private messageService: MessageService,
    private fb: NonNullableFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.filtrosForm.valueChanges.subscribe(() => {
      this.recalcularOpcoesFiltros(this.baseParaOpcoes());
    });

    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.filtrosForm.controls.status.setValue(params['status']);
        this.filtroStatus = params['status'];
      }
      if (params['pagina']) this.paginaAtual = parseInt(params['pagina'], 10) || 0;
      if (params['limite']) this.registrosPorPagina = parseInt(params['limite'], 10) || 10;
      this.carregarClientes();
    });
  }

  carregarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (dados) => {
        this.clientes = dados;
        this.recalcularOpcoesFiltros(this.clientes);
        this.aplicarFiltros(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar clientes', erro);
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível carregar os clientes.' });
      }
    });
  }

  aplicarFiltros(atualizarUrl: boolean = true): void {
    let resultado = [...this.clientes];

    if (this.filtroNome) {
      resultado = resultado.filter(c => c.nome === this.filtroNome);
    }

    if (this.filtroCpf) {
      resultado = resultado.filter(c => c.cpf === this.filtroCpf);
    }

    if (this.filtroEmail) {
      resultado = resultado.filter(c => c.email === this.filtroEmail);
    }

    if (this.filtroTelefone) {
      resultado = resultado.filter(c => c.telefone === this.filtroTelefone);
    }

    if (this.filtroStatus !== 'todos') {
      const ativo = this.filtroStatus === 'ativos';
      resultado = resultado.filter(c => c.ativo === ativo);
    }

    this.totalRegistrosFiltrados = resultado.length;
    this.clientesFiltrados = resultado;

    this.recalcularOpcoesFiltros(resultado);

    if (this.paginaAtual >= this.totalRegistrosFiltrados && this.totalRegistrosFiltrados > 0) {
      this.paginaAtual = Math.max(0, this.totalRegistrosFiltrados - this.registrosPorPagina);
    }

    if (atualizarUrl) {
      this.atualizarUrl();
    }
  }

  atualizarUrl(): void {
    const queryParams: any = {};
    if (this.filtroStatus !== 'todos') queryParams.status = this.filtroStatus;
    if (this.paginaAtual > 0) queryParams.pagina = this.paginaAtual;
    if (this.registrosPorPagina !== 10) queryParams.limite = this.registrosPorPagina;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onMudancaPagina(event: any): void {
    this.paginaAtual = event.first;
    this.registrosPorPagina = event.rows;
    this.atualizarUrl();
  }

  onBuscaChange(): void {
    // Mantido por compatibilidade se precisarmos reusar termo livre no futuro
  }

  onStatusChange(): void {
    this.aplicarFiltros();
  }

  onFiltrosAvancadosChange(): void {
    this.recalcularOpcoesFiltros(this.baseParaOpcoes());
  }

  aoPesquisar(): void {
    const valores = this.filtrosForm.getRawValue();
    this.filtroNome = valores.nome || null;
    this.filtroCpf = valores.cpf || null;
    this.filtroEmail = valores.email || null;
    this.filtroTelefone = valores.telefone || null;
    this.filtroStatus = valores.status || 'todos';
    this.aplicarFiltros(true);
  }

  limparFiltros(): void {
    this.filtrosForm.reset({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      status: 'todos'
    });
    this.aoPesquisar();
  }

  confirmarExclusao(cliente: Cliente): void {
    this.clienteParaExcluir = cliente;
    this.modalExclusaoVisible = true;
  }

  executarExclusao(): void {
    if (!this.clienteParaExcluir) return;

    const cliente = this.clienteParaExcluir;
    
    this.clienteService.excluir(cliente.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Cliente excluído com sucesso' });
        
        this.logService.registrar({
          acao: 'EXCLUSAO',
          mensagem: `Cliente ${cliente.nome} (ID: ${cliente.id}) excluído`,
          usuario: 'usuario_logado' // Simulação
        }).subscribe();

        this.carregarClientes();
        this.modalExclusaoVisible = false;
        this.clienteParaExcluir = null;
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir cliente' });
        this.modalExclusaoVisible = false;
      }
    });
  }

  cancelarExclusao(): void {
    this.modalExclusaoVisible = false;
    this.clienteParaExcluir = null;
  }

  inserirClientesTeste(): void {
    if (!this.ambienteDesenvolvimento) {
      return;
    }

    const clientesMock: Cliente[] = [
      {
        id: this.gerarId(),
        nome: 'Ana Silva',
        cpf: '55566677788',
        email: 'ana.silva@exemplo.com',
        telefone: '85966666666',
        endereco: {
          cep: '60300-000',
          logradouro: 'Rua do Sol',
          numero: '321',
          complemento: 'Apto 202',
          bairro: 'Papicu',
          cidade: 'Fortaleza',
          estado: 'CE'
        },
        ativo: true
      },
      {
        id: this.gerarId(),
        nome: 'Carlos Silva',
        cpf: '99988877766',
        email: 'carlos.silva@exemplo.com',
        telefone: '85955555555',
        endereco: {
          cep: '60400-000',
          logradouro: 'Avenida Washington Soares',
          numero: '654',
          complemento: '',
          bairro: 'Edson Queiroz',
          cidade: 'Fortaleza',
          estado: 'CE'
        },
        ativo: true
      },
      {
        id: this.gerarId(),
        nome: 'Juliana Alves',
        cpf: '33344455566',
        email: 'juliana.alves@exemplo.com',
        telefone: '85944444444',
        endereco: {
          cep: '60500-000',
          logradouro: 'Rua Tibúrcio Cavalcante',
          numero: '987',
          complemento: 'Sala 5',
          bairro: 'Dionísio Torres',
          cidade: 'Fortaleza',
          estado: 'CE'
        },
        ativo: false
      }
    ];

    forkJoin(clientesMock.map(c => this.clienteService.criar(c))).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Clientes de teste inseridos',
          detail: '3 clientes de teste foram adicionados com sucesso.',
          life: 3000
        });
        this.carregarClientes();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Não foi possível inserir os clientes de teste.',
          life: 3000
        });
      }
    });
  }

  private gerarId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
  }

  private recalcularOpcoesFiltros(base: Cliente[]): void {
    const nomes = Array.from(new Set(base.map(c => c.nome).filter(Boolean))).sort();
    const cpfs = Array.from(new Set(base.map(c => c.cpf).filter(Boolean))).sort();
    const emails = Array.from(new Set(base.map(c => c.email).filter(Boolean))).sort();
    const telefones = Array.from(new Set(base.map(c => c.telefone).filter(Boolean))).sort();

    this.opcoesFiltroNome = nomes.map(value => ({ label: value, value }));
    this.opcoesFiltroCpf = cpfs.map(value => ({ label: value, value }));
    this.opcoesFiltroEmail = emails.map(value => ({ label: value, value }));
    this.opcoesFiltroTelefone = telefones.map(value => ({ label: value, value }));

    this.filtroNome = this.ajustarSelecao(this.opcoesFiltroNome);
    this.filtroCpf = this.ajustarSelecao(this.opcoesFiltroCpf);
    this.filtroEmail = this.ajustarSelecao(this.opcoesFiltroEmail);
    this.filtroTelefone = this.ajustarSelecao(this.opcoesFiltroTelefone);
  }

  private ajustarSelecao(opcoes: { label: string; value: string }[]): string | null {
    if (opcoes.length === 1) {
      return opcoes[0].value;
    }

    return null;
  }

  private baseParaOpcoes(): Cliente[] {
    const valores = this.filtrosForm.getRawValue();
    let resultado = [...this.clientes];

    if (valores.status && valores.status !== 'todos') {
      const ativo = valores.status === 'ativos';
      resultado = resultado.filter(c => c.ativo === ativo);
    }

    if (valores.nome) {
      const termo = valores.nome.toLowerCase();
      resultado = resultado.filter(c => c.nome.toLowerCase().includes(termo));
    }

    return resultado;
  }

  novoCliente(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Em desenvolvimento',
      detail: 'Cadastro de novo cliente será implementado em breve',
      life: 3000
    });
  }

  editarCliente(cliente: Cliente): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Em desenvolvimento',
      detail: `Edição de ${cliente.nome} será implementada em breve`,
      life: 3000
    });
  }

  onLinhaClienteClick(cliente: Cliente): void {
    this.editarCliente(cliente);
  }
}
