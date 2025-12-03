import { Component, isDevMode, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '@apresentacao/components/header/header.component';
import { ConfirmModalComponent } from '@apresentacao/components/confirm-modal/confirm-modal.component';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LogService } from '@infraestrutura/services/log.service';
import { MessageService } from 'primeng/api';
import { filter, take, switchMap, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastModule, CommonModule, NgIf, ConfirmModalComponent],
  template: `
    <app-header *ngIf="showHeader"></app-header>
    <div
      class="main-content"
      [style.minHeight]="showHeader ? 'calc(100vh - 80px)' : '100vh'"
    >
      <router-outlet></router-outlet>
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
  .main-content {
      width: 100%;
    }
  `]
})
export class AppComponent implements OnInit {
  showHeader = true;
  showClearDataModal = false;

  constructor(
    private readonly router: Router,
    private readonly clienteService: ClienteService,
    private readonly logService: LogService,
    private readonly messageService: MessageService
  ) {
    this.updateHeaderVisibility(this.router.url);

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => this.updateHeaderVisibility(event.urlAfterRedirects));
  }

  ngOnInit(): void {
    this.checkDevEnvironmentAndData();
  }

  private updateHeaderVisibility(url: string): void {
    this.showHeader = url !== '/login';
  }

  private checkDevEnvironmentAndData(): void {
    const isCypressRunning = typeof (window as any).Cypress !== 'undefined';
    
    if (isDevMode() && !isCypressRunning) {
      forkJoin({
        clientes: this.clienteService.listar({ _limit: '1' }).pipe(take(1), catchError(() => of([]))),
        logs: this.logService.listar().pipe(take(1), catchError(() => of([])))
      }).subscribe({
        next: (result) => {
          const hasClientes = result.clientes && result.clientes.length > 0;
          const hasLogs = result.logs && result.logs.length > 0;
          
          if (hasClientes || hasLogs) {
             this.showClearDataModal = true;
          }
        },
        error: (err) => console.error('Erro ao verificar base de dados', err)
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
}
