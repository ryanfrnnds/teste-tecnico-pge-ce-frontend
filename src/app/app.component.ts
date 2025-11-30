import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="container p-4">
      <h1 class="text-3xl font-bold mb-4">Gestão de Clientes (PGE-CE)</h1>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {}
