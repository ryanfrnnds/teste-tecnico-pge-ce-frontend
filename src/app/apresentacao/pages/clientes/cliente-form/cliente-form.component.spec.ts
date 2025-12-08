import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteFormComponent } from './cliente-form.component';
import { ClienteFormStore } from './cliente-form.store';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LocalizacaoService } from '@infraestrutura/services/localizacao.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ClienteFormComponent', () => {
  let component: ClienteFormComponent;
  let fixture: ComponentFixture<ClienteFormComponent>;
  let store: ClienteFormStore;
  let routerSpy: jasmine.SpyObj<Router>;
  let clienteServiceSpy: jasmine.SpyObj<ClienteService>;
  let localizacaoServiceSpy: jasmine.SpyObj<LocalizacaoService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    clienteServiceSpy = jasmine.createSpyObj('ClienteService', ['buscarPorId', 'criar', 'atualizarCliente']);
    localizacaoServiceSpy = jasmine.createSpyObj('LocalizacaoService', ['listarPaises', 'listarEstados', 'listarMunicipios']);

    localizacaoServiceSpy.listarPaises.and.returnValue(of([{ id: 1, codigo: 'BR', nome: 'Brasil' }]));
    localizacaoServiceSpy.listarEstados.and.returnValue(of([{ id: 1, sigla: 'CE', nome: 'Ceará', paisId: 1 }]));
    localizacaoServiceSpy.listarMunicipios.and.returnValue(of([{ id: 1, nome: 'Fortaleza', estadoId: 1 }]));

    await TestBed.configureTestingModule({
      imports: [ClienteFormComponent, ReactiveFormsModule, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { 
            snapshot: { 
              paramMap: { get: (key: string) => key === 'id' ? null : null },
              data: { formData: undefined }
            } 
          } 
        },
        { provide: Router, useValue: routerSpy },
        { provide: ClienteService, useValue: clienteServiceSpy },
        { provide: LocalizacaoService, useValue: localizacaoServiceSpy },
        MessageService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteFormComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(ClienteFormStore);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar a store no init', () => {
    expect(store.modo()).toBe('novo');
  });

  it('deve chamar salvar na store quando o formulário for submetido', () => {
    spyOn(store, 'salvar');
    const form = store.form;
    form.patchValue({
      nome: 'Teste',
      email: 'teste@email.com',
      cpf: '11111111111'
    });
    
    store.salvar();
    expect(store.salvar).toHaveBeenCalled();
  });

  it('deve chamar voltarParaLista na store quando voltar for chamado', () => {
    spyOn(store, 'voltarParaLista');
    store.voltarParaLista();
    expect(store.voltarParaLista).toHaveBeenCalled();
  });

  it('deve marcar todos os campos como tocados quando o formulário for inválido', () => {
    const form = store.form;
    form.patchValue({
      nome: '',
      email: '',
      cpf: ''
    });
    form.markAllAsTouched();

    expect(form.get('nome')?.touched).toBe(true);
    expect(form.get('email')?.touched).toBe(true);
    expect(form.get('cpf')?.touched).toBe(true);
  });

  it('deve exibir mensagens de erro quando o formulário for inválido', () => {
    const form = store.form;
    
    form.patchValue({
      nome: '',
      email: 'invalid-email',
      cpf: '123'
    });
    
    form.markAllAsTouched();
    fixture.detectChanges();

    const nomeControl = form.get('nome');
    const emailControl = form.get('email');
    const cpfControl = form.get('cpf');

    expect(nomeControl?.invalid).toBe(true);
    expect(emailControl?.invalid).toBe(true);
    expect(cpfControl?.invalid).toBe(true);
  });

});
