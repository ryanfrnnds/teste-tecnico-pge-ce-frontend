import { Routes } from '@angular/router';
import { clientesResolver } from '@core/resolvers/clientes.resolver';
import { logsResolver } from '@core/resolvers/logs.resolver';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'clientes',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/lista-clientes/lista-clientes.component').then(
        (m) => m.ListaClientesComponent
      ),
    resolve: { clientes: clientesResolver },
    canActivate: [authGuard]
  },
  {
    path: 'logs',
    loadComponent: () =>
      import('./pages/logs/lista-logs/lista-logs.component').then(
        (m) => m.ListaLogsComponent
      ),
    resolve: { logs: logsResolver },
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'clientes'
  }
];
