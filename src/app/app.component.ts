import { Component, isDevMode, OnInit, inject } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { PaginatorModule } from 'primeng/paginator';
import { PrimeNG } from 'primeng/config';
import { HeaderComponent } from '@apresentacao/components/header/header.component';
import { ConfirmModalComponent } from '@apresentacao/components/confirm-modal/confirm-modal.component';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LogService } from '@infraestrutura/services/log.service';
import { GlobalPaginatorService } from '@infraestrutura/services/global-paginator.service';
import { MessageService } from 'primeng/api';
import { filter, take, switchMap, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastModule, CommonModule, ConfirmModalComponent, PaginatorModule],
  template: `
    <div class="app-container" [class.with-header]="showHeader">
      @if (showHeader) {
        <app-header></app-header>
      }
      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
      @if (globalPaginatorService.state()) {
        <div class="global-paginator-footer">
          <p-paginator
            [rows]="globalPaginatorService.state()!.rows"
            [first]="globalPaginatorService.state()!.first"
            [totalRecords]="globalPaginatorService.state()!.totalRecords"
            [rowsPerPageOptions]="globalPaginatorService.state()!.rowsPerPageOptions"
            (onPageChange)="onGlobalPaginatorChange($event)"
            [showFirstLastIcon]="globalPaginatorService.state()!.showFirstLastIcon"
          ></p-paginator>
        </div>
      }
    </div>
    <p-toast position="bottom-center"></p-toast>

    <app-confirm-modal
      [visible]="showClearDataModal"
      title="Ambiente de Desenvolvimento"
      message="Detectamos dados existentes na base. Deseja limpar todos os dados (clientes e logs) para iniciar os testes?"
      icon="pi pi-database"
      severity="danger"
      (visibleChange)="showClearDataModal = $event"
      (confirm)="clearAllData()"
      (cancel)="showClearDataModal = false"
    ></app-confirm-modal>
  `,
  styles: [`
  :host {
    display: block;
    height: 100vh;
    width: 100%;
    overflow: hidden;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0;
  }

  .app-container app-header {
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  .app-container.with-header .main-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 0;
    margin-left: var(--pge-spacing-md);
    margin-right: var(--pge-spacing-md);
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  .app-container:not(.with-header) .main-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 0;
    margin-left: var(--pge-spacing-md);
    margin-right: var(--pge-spacing-md);
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
  }

  .global-paginator-footer {
    flex-shrink: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
    margin-left: var(--pge-spacing-md);
    margin-right: var(--pge-spacing-md);
    border-top: 1px solid var(--surface-border);
    
    ::ng-deep .p-paginator {
      background: transparent;
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius);
      padding: 0.5rem;
      width: auto;
      min-width: auto;
    }
  }
  `]
})
export class AppComponent implements OnInit {
  showHeader = true;
  showClearDataModal = false;

  readonly globalPaginatorService = inject(GlobalPaginatorService);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly logService = inject(LogService);
  private readonly messageService = inject(MessageService);
  private readonly primeNG = inject(PrimeNG);

  private verificadoModal = false; // Flag para garantir que verificamos apenas uma vez

  constructor() {
    this.configurarPrimeNGPortugues();
    this.updateHeaderVisibility(this.router.url);

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.updateHeaderVisibility(event.urlAfterRedirects);
      // Verificar dados após a navegação estar completa
      if (!this.verificadoModal) {
        this.checkDevEnvironmentAndData();
      }
    });
  }

  ngOnInit(): void {
    // Aguardar um pouco para garantir que a rota esteja totalmente carregada
    // antes de verificar os dados
    setTimeout(() => {
      this.checkDevEnvironmentAndData();
    }, 100);
  }

  private configurarPrimeNGPortugues(): void {
    this.primeNG.setTranslation({
      accept: 'Aceitar',
      reject: 'Rejeitar',
      choose: 'Escolher',
      upload: 'Enviar',
      cancel: 'Cancelar',
      dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sá'],
      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      today: 'Hoje',
      clear: 'Limpar',
      weekHeader: 'Sem',
      firstDayOfWeek: 0,
      dateFormat: 'dd/mm/yy',
      weak: 'Fraco',
      medium: 'Médio',
      strong: 'Forte',
      passwordPrompt: 'Digite uma senha',
      emptyFilterMessage: 'Nenhum resultado encontrado',
      emptyMessage: 'Nenhuma opção disponível',
      emptySearchMessage: 'Nenhum resultado encontrado',
      aria: {
        trueLabel: 'Verdadeiro',
        falseLabel: 'Falso',
        nullLabel: 'Não selecionado',
        pageLabel: 'Página',
        firstPageLabel: 'Primeira Página',
        lastPageLabel: 'Última Página',
        nextPageLabel: 'Próxima Página',
        previousPageLabel: 'Página Anterior',
        selectAll: 'Selecionar todos',
        unselectAll: 'Desmarcar todos',
        expandRow: 'Expandir',
        collapseRow: 'Recolher'
      }
    });
  }

  private updateHeaderVisibility(url: string): void {
    this.showHeader = url !== '/login';
  }

  private checkDevEnvironmentAndData(): void {
    const isCypressRunning = typeof (window as any).Cypress !== 'undefined';
    
    // Só verificar em modo dev e se não estiver rodando Cypress
    if (!isDevMode() || isCypressRunning || this.showClearDataModal || this.verificadoModal) {
      return;
    }

    // Verificar apenas uma vez se há dados na base
    // Usar contarTotalGeral que é otimizado (limite 1, retorna apenas o header)
    // Só verificar a rota atual para evitar chamadas desnecessárias
    const currentRoute = this.router.url;
    
    // Não verificar em rotas de login ou redirecionamento
    if (currentRoute === '/' || currentRoute === '/login') {
      return;
    }
    
    if (currentRoute.startsWith('/clientes')) {
      // Se está na rota de clientes, verificar apenas clientes (chamada rápida)
      this.verificadoModal = true; // Marcar como verificado antes da chamada
      this.clienteService.contarTotalGeral().pipe(
        take(1),
        catchError(() => of(0))
      ).subscribe({
        next: (total) => {
          if (total > 0) {
            this.showClearDataModal = true;
          }
        },
        error: () => {
          // Silenciar erros para não poluir o console
        }
      });
    } else if (currentRoute.startsWith('/logs')) {
      // Se está na rota de logs, verificar apenas logs (chamada rápida)
      this.verificadoModal = true; // Marcar como verificado antes da chamada
      this.logService.listar().pipe(
        take(1),
        catchError(() => of([]))
      ).subscribe({
        next: (logs) => {
          if (logs && logs.length > 0) {
            this.showClearDataModal = true;
          }
        },
        error: () => {
          // Silenciar erros para não poluir o console
        }
      });
    }
  }

  clearAllData(): void {
    forkJoin([
      this.clienteService.limparBaseDeDados(),
      this.logService.limparTodosLogs()
    ]).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Base de dados (clientes e logs) limpa com sucesso.'
        });
        this.showClearDataModal = false;
        window.location.reload();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao limpar base de dados.'
        });
      }
    });
  }

  onGlobalPaginatorChange(event: any): void {
    const callback = this.globalPaginatorService.callback();
    if (callback) {
      callback(event);
    }
  }
}
