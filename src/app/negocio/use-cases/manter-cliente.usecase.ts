import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '@dominio/models/cliente.model';
import { ClienteService } from '@infraestrutura/services/cliente.service';

/**
 * Use Case responsável por criar ou atualizar um cliente.
 * Encapsula a regra de negócio de decidir se é criação ou edição baseado na presença do ID.
 */
@Injectable({
  providedIn: 'root'
})
export class ManterClienteUseCase {
  constructor(private clienteService: ClienteService) {}

  /**
   * Executa a operação de salvar (criar ou atualizar) um cliente.
   * @param cliente Dados do cliente a ser salvo
   * @param isEdicao Flag opcional para forçar modo edição, caso o ID não seja suficiente
   * @returns Observable com o cliente salvo
   */
  execute(cliente: Cliente, isEdicao: boolean): Observable<Cliente> {
    // Regra de Negócio: Validação pré-persistência poderia estar aqui
    // Ex: Verificar duplicação de CPF antes de chamar serviço (se API não fizesse)

    if (isEdicao) {
      return this.clienteService.atualizarCliente(cliente);
    } else {
      return this.clienteService.criar(cliente);
    }
  }
}

