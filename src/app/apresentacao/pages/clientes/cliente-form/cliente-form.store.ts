import { Injectable, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { finalize, first, switchMap } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

import { Cliente } from '@dominio/models/cliente.model';
import { ClienteService } from '@infraestrutura/services/cliente.service';
import { LocalizacaoService, Pais, Estado, Municipio } from '@infraestrutura/services/localizacao.service';
import { ManterClienteUseCase } from '@negocio/use-cases/manter-cliente.usecase';
import { dataNaoFuturaValidator, cpfBasicoValidator } from '@dominio/validacoes/cliente.validators';

type ModoFormulario = 'novo' | 'edicao';

@Injectable()
export class ClienteFormStore {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly messageService = inject(MessageService);
  private readonly localizacaoService = inject(LocalizacaoService);
  private readonly manterClienteUseCase = inject(ManterClienteUseCase);

  // --- State Signals ---
  readonly modo = signal<ModoFormulario>('novo');
  readonly carregando = signal<boolean>(false);
  readonly paises = signal<Pais[]>([]);
  readonly estados = signal<Estado[]>([]);
  readonly municipios = signal<Municipio[]>([]);
  
  // Derived UI Signals
  readonly titulo = computed(() => 
    this.modo() === 'novo' ? 'Novo Cliente' : 'Editar Cliente'
  );

  readonly estadosFiltrados = signal<Estado[]>([]);
  readonly municipiosFiltrados = signal<Municipio[]>([]);
  readonly telefoneMask = signal<string | null>('(99) 9999-9999'); // Default BR mask
  readonly cepMask = signal<string | null>(null);

  // --- Form Definition ---
  readonly form: FormGroup = this.fb.group({
    id: [''], // Hidden field for ID
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: [''],
    dataNascimento: [null as Date | null, [Validators.required, dataNaoFuturaValidator]],
    tipoContato: ['Whatsapp', [Validators.required]],
    telefone: ['', [Validators.required]],
    pais: ['BR', [Validators.required]],
    endereco: this.fb.group({
      cep: ['', [Validators.required]],
      logradouro: ['', [Validators.required]],
      numero: ['', [Validators.required, Validators.maxLength(5)]],
      complemento: [''],
      bairro: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
      estado: ['', [Validators.required]]
    }),
    ativo: [true]
  });

  constructor() {
    this.form.get('pais')?.valueChanges.subscribe((paisCodigo: string) => {
      this.onPaisChange(paisCodigo);
    });

    this.form.get('telefone')?.valueChanges.subscribe(() => {
      this.atualizarTelefoneMask();
    });

    this.form.get('endereco.estado')?.valueChanges.subscribe((estadoId) => {
       if (estadoId) this.onEstadoChange(estadoId);
    });
  }


  /**
   * Inicializa o store: carrega listas de localização e, se houver ID, carrega o cliente.
   * @param idCliente ID opcional para edição
   */
  init(idCliente: string | null) {
    this.carregando.set(true);

    forkJoin({
      paises: this.localizacaoService.listarPaises(),
      estados: this.localizacaoService.listarEstados(),
      municipios: this.localizacaoService.listarMunicipios()
    }).pipe(
      switchMap(dados => {
        this.paises.set(dados.paises);
        this.estados.set(dados.estados);
        this.municipios.set(dados.municipios);

        if (idCliente) {
          this.modo.set('edicao');
          return this.clienteService.buscarPorId(idCliente);
        } else {
          this.modo.set('novo');
          return of(null);
        }
      }),
      finalize(() => this.carregando.set(false))
    ).subscribe({
      next: (cliente) => {
        if (cliente) {
          this.preencherFormulario(cliente);
        } else {
          this.inicializarFormularioNovo();
        }
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar dados iniciais.'
        });
        this.router.navigate(['/clientes']);
      }
    });
  }

  private inicializarFormularioNovo(): void {
    this.form.reset({
      pais: 'BR',
      tipoContato: 'Whatsapp',
      ativo: true,
      endereco: {
          estado: '',
          cidade: ''
      }
    });
    this.onPaisChange('BR'); 
  }

  private preencherFormulario(cliente: Cliente): void {
    const dataNascimento = cliente.dataNascimento
      ? new Date(cliente.dataNascimento)
      : null;

    const paisCodigo = this.obterCodigoPaisPorNome(cliente.pais || 'Brasil');

    this.form.patchValue({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      cpf: cliente.cpf,
      dataNascimento,
      tipoContato: cliente.tipoContato || 'Whatsapp',
      telefone: cliente.telefone,
      pais: paisCodigo,
      endereco: {
        cep: cliente.endereco.cep,
        logradouro: cliente.endereco.logradouro,
        numero: cliente.endereco.numero,
        complemento: cliente.endereco.complemento || '',
        bairro: cliente.endereco.bairro,
        cidade: cliente.endereco.cidade,
        estado: cliente.endereco.estado
      },
      ativo: cliente.ativo
    });
    
    this.onPaisChange(paisCodigo);
    
    if (cliente.endereco.estado) {
        this.onEstadoChange(cliente.endereco.estado);
    }
    
    this.atualizarTelefoneMask();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsDirty();
        control?.markAsTouched();
        
        if (control instanceof FormGroup) {
             Object.keys(control.controls).forEach(nestedKey => {
                 const nestedControl = control.get(nestedKey);
                 nestedControl?.markAsDirty();
                 nestedControl?.markAsTouched();
             });
        }
      });

      this.messageService.add({
        severity: 'warn',
        summary: 'Formulário incompleto',
        detail: 'Verifique os campos destacados antes de continuar.'
      });
    }

    const valor = this.form.getRawValue();
    
    const clientePayload: Cliente = {
      id: this.modo() === 'edicao' ? valor.id : this.gerarIdCliente(),
      nome: valor.nome,
      email: valor.email,
      cpf: (valor.cpf || '').replace(/\D/g, ''),
      telefone: (valor.telefone || '').replace(/\D/g, ''),
      tipoContato: valor.tipoContato,
      dataNascimento: valor.dataNascimento
        ? (valor.dataNascimento as Date).toISOString()
        : undefined,
      pais: valor.pais,
      endereco: {
        cep: valor.endereco.cep,
        logradouro: valor.endereco.logradouro,
        numero: valor.endereco.numero,
        complemento: valor.endereco.complemento || '',
        bairro: valor.endereco.bairro,
        cidade: valor.endereco.cidade,
        estado: valor.endereco.estado
      },
      ativo: valor.ativo
    };

    this.carregando.set(true);

    this.manterClienteUseCase.execute(clientePayload, this.modo() === 'edicao')
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: this.modo() === 'novo'
              ? 'Cliente cadastrado com sucesso.'
              : 'Cliente atualizado com sucesso.'
          });
          this.router.navigate(['/clientes']);
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível salvar os dados do cliente.'
          });
        }
      });
  }

  buscarCep(): void {
    const enderecoGroup = this.form.get('endereco') as FormGroup;
    const cepControl = enderecoGroup.get('cep');
    if (!cepControl?.value) return;

    const cepLimpo = (cepControl.value as string).replace(/\D/g, '');
    
    if (this.form.get('pais')?.value === 'BR' && cepLimpo.length !== 8) return;

    if (cepLimpo.length < 5) return; 

    this.localizacaoService.buscarCep(cepLimpo).subscribe((lista) => {
      if (!lista || lista.length === 0) return;

      const cepInfo = lista[0];
      const municipio = this.municipios().find(m => m.id === cepInfo.municipioId);
      if (!municipio) return;

      const estado = this.estados().find(e => e.id === municipio.estadoId);
      if (!estado) return;

      const pais = this.paises().find(p => p.id === estado.paisId);
      if (!pais) return;

      this.form.patchValue({
        pais: pais.codigo,
        endereco: {
          cidade: municipio.nome,
          estado: estado.id,
          bairro: cepInfo.bairro,
          logradouro: cepInfo.logradouro
        }
      });
    });
  }

  voltarParaLista(): void {
    this.router.navigate(['/clientes']);
  }

  preencherComDadosAleatorios(): void {
    const nomes = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena'];
    const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Lima'];
    const tiposContato = ['Celular', 'Whatsapp', 'Residencial'];
    
    const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    const nome = `${randomItem(nomes)} ${randomItem(sobrenomes)}`;
    const email = `${nome.toLowerCase().replace(/\s+/g, '.')}@exemplo.com`;
    const cpf = `${randomNum(100, 999)}.${randomNum(100, 999)}.${randomNum(100, 999)}-${randomNum(10, 99)}`;
    const telefone = `(11) 9${randomNum(1000, 9999)}-${randomNum(1000, 9999)}`;
    const nascimento = new Date(randomNum(1970, 2000), randomNum(0, 11), randomNum(1, 28));
    
    const cep = '01001-000'; 
    
    this.form.patchValue({
        nome,
        email,
        cpf,
        dataNascimento: nascimento,
        tipoContato: randomItem(tiposContato),
        telefone,
        pais: 'BR',
        endereco: {
            cep,
            logradouro: 'Praça da Sé',
            numero: randomNum(1, 999).toString(),
            complemento: randomNum(0, 1) ? `Apto ${randomNum(1, 100)}` : '',
            bairro: 'Sé',
            cidade: 'São Paulo', 
            estado: 2 
        }
    });
    
    
    this.buscarCep();
  }

  // --- Helper Methods ---

  private onPaisChange(paisCodigo: string): void {
    if (paisCodigo === 'BR') {
      this.aplicarValidadoresCpfPorPais('BR');
      this.cepMask.set('99.999-999');
      this.atualizarTelefoneMask(); 
    } else {
      this.aplicarValidadoresCpfPorPais('OUTRO');
      this.cepMask.set(null); 
      this.telefoneMask.set(null); 
    }
    
    const paisSelecionado = this.paises().find(p => p.codigo === paisCodigo);
    
    if (!paisSelecionado) {
      this.estadosFiltrados.set([]);
      this.municipiosFiltrados.set([]);
      return;
    }

    const estadosDoPais = this.estados().filter(e => e.paisId === paisSelecionado.id);
    this.estadosFiltrados.set(estadosDoPais);

    const currentEstado = this.form.get('endereco.estado')?.value;
    if (currentEstado && !estadosDoPais.find(e => e.id === currentEstado)) {
        this.form.get('endereco.estado')?.setValue('');
        this.form.get('endereco.cidade')?.setValue('');
        this.municipiosFiltrados.set([]);
    }
  }

  private onEstadoChange(estadoId: any): void {
    const estadoIdNum = Number(estadoId); 
    const municipiosDoEstado = this.municipios().filter(m => m.estadoId === estadoIdNum);
    this.municipiosFiltrados.set(municipiosDoEstado);
    
    const currentCity = this.form.get('endereco.cidade')?.value;
    if (currentCity && !municipiosDoEstado.find(m => m.nome === currentCity)) {
        this.form.get('endereco.cidade')?.setValue('');
    }
  }

  private aplicarValidadoresCpfPorPais(paisCode: string): void {
    const cpfControl = this.form.get('cpf');
    if (!cpfControl) return;

    if (paisCode === 'BR') {
      cpfControl.setValidators([Validators.required, cpfBasicoValidator]);
    } else {
      cpfControl.setValidators([cpfBasicoValidator]);
    }
    cpfControl.updateValueAndValidity({ emitEvent: false });
  }

  private atualizarTelefoneMask(): void {
    const pais = this.form.get('pais')?.value;
    if (pais !== 'BR') {
        this.telefoneMask.set(null);
        return;
    }

    const telefoneControl = this.form.get('telefone');
    if (!telefoneControl) return;

    const digits = (telefoneControl.value || '').replace(/\D/g, '');
    if (digits.length > 10) {
      this.telefoneMask.set('(99) 9 9999-9999');
    } else {
      this.telefoneMask.set('(99) 9999-9999');
    }
  }

  private obterCodigoPaisPorNome(nome: string): string {
    const encontrado = this.paises().find(p => p.nome === nome);
    return encontrado ? encontrado.codigo : 'BR';
  }

  private gerarIdCliente(): string {
    return `cli-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

