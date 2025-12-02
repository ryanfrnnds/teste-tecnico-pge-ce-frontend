import { Routes } from '@angular/router';
import { authGuard } from '@infraestrutura/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clientes',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./apresentacao/pages/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./apresentacao/pages/clientes/lista-clientes/lista-clientes.component').then(
        (m) => m.ListaClientesComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'clientes/novo',
    loadComponent: () =>
      import('./apresentacao/pages/clientes/cliente-form/cliente-form.component').then(
        (m) => m.ClienteFormComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'clientes/:id/editar',
    loadComponent: () =>
      import('./apresentacao/pages/clientes/cliente-form/cliente-form.component').then(
        (m) => m.ClienteFormComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: 'logs',
    loadComponent: () =>
      import('./apresentacao/pages/logs/lista-logs/lista-logs.component').then(
        (m) => m.ListaLogsComponent
      ),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'clientes'
  }
];
