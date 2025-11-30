import { Routes } from '@angular/router';
import { ListaClientesComponent } from './pages/clientes/lista-clientes/lista-clientes.component';
import { ListaLogsComponent } from './pages/logs/lista-logs/lista-logs.component';
import { clientesResolver } from '@core/resolvers/clientes.resolver';
import { logsResolver } from '@core/resolvers/logs.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
  { path: 'clientes', component: ListaClientesComponent, resolve: { clientes: clientesResolver } },
  { path: 'logs', component: ListaLogsComponent, resolve: { logs: logsResolver } }
];
