import { TestBed } from '@angular/core/testing';
import { ClienteFormStore } from './cliente-form.store';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LocalizacaoService } from '@infraestrutura/services/localizacao.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Cliente } from '@dominio/models/cliente.model';

describe('ClienteFormStore', () => {
  let store: ClienteFormStore;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;
  let localizacaoServiceSpy: jasmine.SpyObj<LocalizacaoService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPaises = [{ id: 1, nome: 'Brasil', codigo: 'BR' }];
  const mockEstados = [{ id: 1, nome: 'São Paulo', sigla: 'SP', paisId: 1 }];
  const mockMunicipios = [{ id: 1, nome: 'São Paulo', estadoId: 1 }];
  const mockCliente: Cliente = {
    id: '1',
    nome: 'Teste',
    email: 'teste@email.com',
    cpf: '11111111111',
    telefone: '11999999999',
    tipoContato: 'Whatsapp',
    dataNascimento: new Date('1990-01-01').toISOString(),
    pais: 'BR',
    endereco: {
      cep: '01001000',
      logradouro: 'Rua Teste',
      numero: '123',
      bairro: 'Bairro Teste',
      cidade: 'São Paulo',
      estado: 1,
      complemento: 'Apto 1'
    },
    ativo: true
  } as unknown as Cliente;

  beforeEach(() => {
    clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['buscarPorId', 'criar', 'atualizarCliente']);
    localizacaoServiceSpy = jasmine.createSpyObj('LocalizacaoService', ['listarPaises', 'listarEstados', 'listarMunicipios', 'buscarCep']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        ClienteFormStore,
        FormBuilder,
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: LocalizacaoService, useValue: localizacaoServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    store = TestBed.inject(ClienteFormStore);

    // Default mocks
    localizacaoServiceSpy.listarPaises.and.returnValue(of(mockPaises));
    localizacaoServiceSpy.listarEstados.and.returnValue(of(mockEstados));
    localizacaoServiceSpy.listarMunicipios.and.returnValue(of(mockMunicipios));
  });

  it('deve ser criado', () => {
    expect(store).toBeTruthy();
  });

  it('deve inicializar com dados de localização', () => {
    store.init(null);
    expect(store.paises()).toEqual(mockPaises);
    expect(store.estados()).toEqual(mockEstados);
    expect(store.municipios()).toEqual(mockMunicipios);
    expect(store.modo()).toBe('novo');
  });

  it('deve carregar cliente na edição', () => {
    clienteServiceSpy.buscarPorId.and.returnValue(of(mockCliente));
    store.init('1');

    expect(store.modo()).toBe('edicao');
    expect(store.form.get('nome')?.value).toBe('Teste');
    expect(store.form.get('email')?.value).toBe('teste@email.com');
  });

  it('deve validar CPF inválido para BR', () => {
    store.init(null);
    const cpfControl = store.form.get('cpf');
    
    cpfControl?.setValue('123');
    expect(cpfControl?.invalid).toBeTrue();
    expect(cpfControl?.errors?.['cpfInvalido']).toBeTrue();
    
    cpfControl?.setValue('111.111.111-11'); // 11 digitos
    expect(cpfControl?.valid).toBeTrue();
  });

  it('deve validar data futura', () => {
    const dataFutura = new Date();
    dataFutura.setFullYear(dataFutura.getFullYear() + 1);
    
    const control = store.form.get('dataNascimento');
    control?.setValue(dataFutura);
    
    expect(control?.invalid).toBeTrue();
    expect(control?.errors?.['dataFutura']).toBeTrue();
  });

  it('deve salvar novo cliente com sucesso', () => {
    store.init(null);
    store.form.patchValue({
      nome: 'Novo Cliente',
      email: 'novo@email.com',
      cpf: '11111111111',
      tipoContato: 'Whatsapp',
      telefone: '11999999999',
      pais: 'BR',
      dataNascimento: new Date('1990-01-01'),
      endereco: {
        cep: '01001000',
        logradouro: 'Rua',
        numero: '123',
        bairro: 'Bairro',
        cidade: 'Cidade',
        estado: 1
      }
    });

    clienteServiceSpy.criar.and.returnValue(of({ ...mockCliente, id: 'new-id' }));

    store.salvar();

    expect(clienteServiceSpy.criar).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clientes']);
  });

  it('deve atualizar cliente com sucesso', () => {
    clienteServiceSpy.buscarPorId.and.returnValue(of(mockCliente));
    store.init('1');
    
    clienteServiceSpy.atualizarCliente.and.returnValue(of(mockCliente));
    
    store.salvar();

    expect(clienteServiceSpy.atualizarCliente).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  it('deve tratar erro ao salvar', () => {
    store.init(null);
    store.form.patchValue({ ...mockCliente, id: undefined }); // Valid form
    
    clienteServiceSpy.criar.and.returnValue(throwError(() => new Error('Erro API')));
    
    store.salvar();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('deve buscar CEP e preencher endereço', () => {
    store.init(null);
    const mockCepResult = [{
      cep: '01001000',
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      municipioId: 1,
      id: 0 // Propriedade necessária para CepInfo
    }];
    
    localizacaoServiceSpy.buscarCep.and.returnValue(of(mockCepResult));
    store.form.get('endereco.cep')?.setValue('01001000');
    
    store.buscarCep();

    expect(store.form.get('endereco.logradouro')?.value).toBe('Praça da Sé');
    expect(store.form.get('endereco.bairro')?.value).toBe('Sé');
  });
});

