import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClienteFormComponent } from './cliente-form.component';
import { ClienteFormStore } from './cliente-form.store';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ClienteFormComponent', () => {
  let component: ClienteFormComponent;
  let fixture: ComponentFixture<ClienteFormComponent>;
  let storeSpy: jasmine.SpyObj<ClienteFormStore>;

  const fb = new FormBuilder();
  const formGroup = fb.group({
    id: [''],
    nome: [''],
    email: [''],
    cpf: [''],
    dataNascimento: [null],
    tipoContato: ['Whatsapp'],
    telefone: [''],
    pais: ['BR'],
    endereco: fb.group({
      cep: [''],
      logradouro: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      estado: ['']
    }),
    ativo: [true]
  });

  beforeEach(async () => {
    storeSpy = jasmine.createSpyObj('ClienteFormStore', ['init', 'salvar', 'voltarParaLista', 'buscarCep'], {
      form: formGroup,
      modo: () => 'novo',
      carregando: () => false,
      titulo: () => 'Novo Cliente',
      paises: () => [],
      estadosFiltrados: () => [],
      municipiosFiltrados: () => [],
      telefoneMask: () => '(99) 9999-9999',
      cepMask: () => '99.999-999'
    });

    await TestBed.configureTestingModule({
      imports: [ClienteFormComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
        MessageService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .overrideComponent(ClienteFormComponent, {
      set: {
        providers: [
          { provide: ClienteFormStore, useValue: storeSpy }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize store on init', () => {
    expect(storeSpy.init).toHaveBeenCalled();
  });
});
