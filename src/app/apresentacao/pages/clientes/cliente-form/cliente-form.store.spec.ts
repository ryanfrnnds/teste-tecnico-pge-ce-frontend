import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClienteFormStore } from './cliente-form.store';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LocalizacaoService } from '@infraestrutura/services/localizacao.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Cliente } from '@dominio/models/cliente.model';

/**
 * Suite de testes para ClienteFormStore.
 * 
 * Testa o gerenciamento de estado do formulário de cliente, incluindo:
 * - Inicialização e carregamento de dados de localização
 * - Validações de formulário (CPF, data futura)
 * - Criação e edição de clientes
 * - Busca de CEP e preenchimento automático
 * - Tratamento de erros
 * 
 * @module ClienteFormStore
 */
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
    localizacaoServiceSpy = jasmine.createSpyObj('LocalizacaoService', ['listarPaises', 'listarEstados', 'listarMunicipios']);
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

    localizacaoServiceSpy.listarPaises.and.returnValue(of(mockPaises));
    localizacaoServiceSpy.listarEstados.and.returnValue(of(mockEstados));
    localizacaoServiceSpy.listarMunicipios.and.returnValue(of(mockMunicipios));

    store = TestBed.inject(ClienteFormStore);
  });

  /**
   * Deve instanciar o store corretamente.
   */
  it('deve ser criado', () => {
    expect(store).toBeTruthy();
  });

  /**
   * Deve carregar países, estados e municípios na inicialização e definir modo como 'novo'.
   */
  it('deve inicializar com dados de localização', () => {
    store.init(null);
    expect(store.paises()).toEqual(mockPaises);
    expect(store.estados()).toEqual(mockEstados);
    expect(store.municipios()).toEqual(mockMunicipios);
    expect(store.modo()).toBe('novo');
  });

  /**
   * Deve carregar dados do cliente quando ID é fornecido e preencher formulário.
   */
  it('deve carregar cliente na edição', () => {
    clienteServiceSpy.buscarPorId.and.returnValue(of(mockCliente));
    store.init('1');

    expect(store.modo()).toBe('edicao');
    expect(store.form.get('nome')?.value).toBe('Teste');
    expect(store.form.get('email')?.value).toBe('teste@email.com');
  });

  /**
   * Deve validar CPF com 11 dígitos quando país é Brasil (BR).
   */
  it('deve validar CPF inválido para BR', () => {
    store.init(null);
    const cpfControl = store.form.get('cpf');
    
    cpfControl?.setValue('123');
    expect(cpfControl?.invalid).toBeTrue();
    expect(cpfControl?.errors?.['cpfInvalido']).toBeTrue();
    
    cpfControl?.setValue('111.111.111-11');
    expect(cpfControl?.valid).toBeTrue();
  });

  /**
   * Deve rejeitar datas futuras usando o validador dataNaoFuturaValidator.
   */
  it('deve validar data futura', () => {
    const dataFutura = new Date();
    dataFutura.setFullYear(dataFutura.getFullYear() + 1);
    
    const control = store.form.get('dataNascimento');
    control?.setValue(dataFutura);
    
    expect(control?.invalid).toBeTrue();
    expect(control?.errors?.['dataFutura']).toBeTrue();
  });

  /**
   * Deve criar novo cliente, exibir mensagem de sucesso e navegar para lista.
   * Usa fakeAsync para controlar operações assíncronas.
   */
  it('deve salvar novo cliente com sucesso', fakeAsync(() => {
    store.init(null);
    tick();

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
        cidade: 'São Paulo',
        estado: 1
      }
    });
    tick();

    expect(store.form.valid).toBeTrue();

    clienteServiceSpy.criar.and.returnValue(of({ ...mockCliente, id: 'new-id' }));

    store.salvar();
    tick();

    expect(clienteServiceSpy.criar).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clientes']);
  }));

  /**
   * Deve atualizar cliente existente quando modo é 'edicao'.
   */
  it('deve atualizar cliente com sucesso', () => {
    clienteServiceSpy.buscarPorId.and.returnValue(of(mockCliente));
    store.init('1');
    
    clienteServiceSpy.atualizarCliente.and.returnValue(of(mockCliente));
    
    store.salvar();

    expect(clienteServiceSpy.atualizarCliente).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  });

  /**
   * Deve exibir mensagem de erro quando a API falha ao salvar.
   */
  it('deve tratar erro ao salvar', () => {
    store.init(null);
    store.form.patchValue({ 
      ...mockCliente, 
      dataNascimento: new Date(mockCliente.dataNascimento!),
      id: undefined 
    });
    
    clienteServiceSpy.criar.and.returnValue(throwError(() => new Error('Erro API')));
    
    store.salvar();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

});

