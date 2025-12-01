import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ThemeService, ThemeMode } from '@core/services/theme.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  appTitle = 'Sistema de Gestão de Clientes';
  appSubtitle = 'PGE-CE';

  temaAtual: ThemeMode = 'dark';

  usuario$ = this.authService.user$;
  userMenuItems: MenuItem[] = [];

  constructor(
    private readonly themeService: ThemeService,
    private readonly authService: AuthService
  ) {
    this.themeService.modo$.subscribe((modo) => (this.temaAtual = modo));

    this.usuario$.subscribe((usuario) => {
      if (usuario) {
        this.userMenuItems = [
          {
            label: usuario.name,
            icon: 'pi pi-user',
            disabled: true
          },
          { separator: true },
          {
            label: 'Sair',
            icon: 'pi pi-sign-out',
            command: () => this.logout()
          }
        ];
      } else {
        this.userMenuItems = [];
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  alternarTema(): void {
    this.themeService.alternarTema();
  }
}


