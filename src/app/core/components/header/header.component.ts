import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ThemeService, ThemeMode } from '@core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  appTitle = 'Sistema de Gestão de Clientes';
  appSubtitle = 'PGE-CE';

  temaAtual: ThemeMode = 'dark';

  constructor(private readonly themeService: ThemeService) {
    this.themeService.modo$.subscribe((modo) => (this.temaAtual = modo));
  }

  alternarTema(): void {
    this.themeService.alternarTema();
  }
}


