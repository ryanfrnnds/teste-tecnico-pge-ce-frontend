import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente wrapper para tabelas dentro do container de listagem.
 * Gerencia altura e scroll da tabela PrimeNG.
 */
@Component({
  selector: 'app-lista-page-table-wrapper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-page-container-table-wrapper.component.html',
  styleUrl: './lista-page-container-table-wrapper.component.scss'
})
export class ListaPageTableWrapperComponent {
  /**
   * Altura do header global em pixels (padrão: 60px)
   */
  @Input() globalHeaderHeight: number = 60;

  /**
   * Altura das tabs mobile em pixels (padrão: 50px)
   */
  @Input() mobileTabsHeight: number = 50;

  /**
   * Altura estimada do header da página em pixels (padrão: 80px)
   */
  @Input() pageHeaderHeight: number = 80;

  /**
   * Altura estimada dos filtros em pixels (padrão: 120px)
   */
  @Input() filtersHeight: number = 120;

  /**
   * Gaps entre elementos em rem (padrão: 2rem)
   */
  @Input() gapsRem: number = 2;

  /**
   * Altura da paginação em pixels (padrão: 48px = 3rem)
   */
  @Input() paginatorHeight: number = 48;

  /**
   * Calcula a altura máxima disponível para a tabela
   * Considera: header global, tabs mobile, header da página, filtros, paginação e gaps
   * O cálculo é baseado em 100vh menos todos os elementos fixos
   */
  get tableHeight(): string {
    const totalSubtracted = this.globalHeaderHeight + this.mobileTabsHeight + this.pageHeaderHeight + this.filtersHeight + this.paginatorHeight;
    const gapsInPx = this.gapsRem * 16;
    const total = totalSubtracted + gapsInPx;
    return `calc(100vh - ${total}px)`;
  }
}

