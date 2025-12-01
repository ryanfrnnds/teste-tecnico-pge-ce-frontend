import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { clientesResolver } from './clientes.resolver';
import { ClienteService } from '../services/cliente.service';
import { Cliente } from '../models/cliente.model';

describe('clientesResolver', () => {
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;

  const mockClientes: Cliente[] = [
    {
      id: '1',
      nome: 'Ana',
      cpf: '11111111111',
      email: 'ana@example.com',
      telefone: '85999999999',
      endereco: {
        cep: '60000000',
        logradouro: 'Rua A',
        numero: '10',
        complemento: '',
        bairro: 'Centro',
        cidade: 'Fortaleza',
        estado: 'CE'
      },
      ativo: true
    }
  ];

  beforeEach(() => {
    clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['listar']);

    TestBed.configureTestingModule({
      providers: [{ provide: ClienteService, useValue: clienteServiceSpy }]
    });
  });

  it('deve resolver lista de clientes usando ClienteService.listar', (done) => {
    clienteServiceSpy.listar.and.returnValue(of(mockClientes));

    TestBed.runInInjectionContext(() => {
      clientesResolver().subscribe((result) => {
        expect(clienteServiceSpy.listar).toHaveBeenCalled();
        expect(result).toEqual(mockClientes);
        done();
      });
    });
  });
});


