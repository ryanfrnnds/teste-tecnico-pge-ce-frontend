import { Routes } from '@angular/router';
import { ListaClientesComponent } from '@pages/clientes/lista-clientes/lista-clientes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'clientes', pathMatch: 'full' },
  { path: 'clientes', component: ListaClientesComponent }
];
