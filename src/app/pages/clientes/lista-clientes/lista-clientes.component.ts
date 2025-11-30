import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Cliente } from '@core/models/cliente.model';
import { ClienteService } from '@core/services/cliente.service';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, TagModule],
  templateUrl: './lista-clientes.component.html',
  styleUrls: []
})
export class ListaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  carregando: boolean = true;

  constructor(private clienteService: ClienteService) {}

  ngOnInit(): void {
    this.carregarClientes();
  }

  carregarClientes(): void {
    this.carregando = true;
    this.clienteService.listar().subscribe({
      next: (dados) => {
        this.clientes = dados;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar clientes', erro);
        this.carregando = false;
      }
    });
  }

  getSeveridadeStatus(ativo: boolean): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    return ativo ? 'success' : 'danger';
  }
}

