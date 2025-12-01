import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { HeaderComponent } from '@core/components/header/header.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, ToastModule, CommonModule, NgIf],
  template: `
    <app-header *ngIf="showHeader"></app-header>
    <div
      class="main-content"
      [style.minHeight]="showHeader ? 'calc(100vh - 80px)' : '100vh'"
    >
      <router-outlet></router-outlet>
    </div>
    <p-toast position="bottom-center"></p-toast>
  `,
  styles: [`
  .main-content {
      width: 100%;
    }
  `]
})
export class AppComponent {
  showHeader = true;

  constructor(private readonly router: Router) {
    this.updateHeaderVisibility(this.router.url);

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => this.updateHeaderVisibility(event.urlAfterRedirects));
  }

  private updateHeaderVisibility(url: string): void {
    this.showHeader = url !== '/login';
  }
}
