import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '@core/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastModule],
  template: `
    <app-header></app-header>
    <div class="main-content">
      <router-outlet></router-outlet>
    </div>
    <p-toast position="bottom-center"></p-toast>
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 80px); /* Ajuste baseado na altura do header */
    }
  `]
})
export class AppComponent {}
