import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente wrapper reutilizável para páginas de listagem.
 * Estrutura: HEADER (título + botão) -> BODY (filtros + lista) -> FOOTER (paginação)
 */
@Component({
  selector: 'app-lista-page-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-page-container.component.html',
  styleUrl: './lista-page-container.component.scss'
})
export class ListaPageContainerComponent {
}

