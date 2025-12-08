/**
 * @description
 * `ClienteFormStore` é o *Store* responsável por gerenciar todo o estado
 * e comportamento da tela de cadastro/edição de clientes.
 * 
 * ## 📦 O que é um STORE?
 * Um Store é uma camada que centraliza:
 * - Estados da tela (signals, computed e form)
 * - Regras de interação (troca de país, estado, CEP, masks)
 * - Coordenação do fluxo da UI (init, salvar, voltar)
 * - Chamadas para casos de uso e serviços externos
 * 
 * Ele organiza dados e ações de maneira reativa, deixando o componente limpo.
 * A UI apenas consome sinais e chama métodos públicos do Store.
 *
 * ## 📄 O que são STATES?
 * Nesta classe, **states** são:
 * - Signals (`modo`, `carregando`, `paises`, `estados`, etc.)
 * - Signals derivados (`titulo`)
 * - Estados de formulário (`form: FormGroup`) esse state 
 * 
 * Esses estados representam o *estado atual da tela*.
 * Quando alterados, disparam atualização automática na UI.
 *
 * ## 🧩 Resumo
 * - O Store é o **container** do estado e lógica da tela.
 * - Os States são **os dados reativos em si**.
 * - O componente apenas renderiza e delega ações ao Store.
 */

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

  readonly modo = signal<ModoFormulario>('novo');
  readonly carregando = signal<boolean>(false);
  readonly paises = signal<Pais[]>([]);
  readonly estados = signal<Estado[]>([]);
  readonly municipios = signal<Municipio[]>([]);
  
  readonly titulo = computed(() =>
    this.modo() === 'novo' ? 'Novo Cliente' : 'Editar Cliente'
  );

  readonly estadosFiltrados = signal<Estado[]>([]);
  readonly municipiosFiltrados = signal<Municipio[]>([]);
  readonly telefoneMask = signal<string | null>('(99) 9999-9999');
  readonly cepMask = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    id: [''],
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

  initComDados(idCliente: string | null, formData: { cliente: any; paises: any[]; estados: any[]; municipios: any[] }): void {
    this.carregando.set(true);
    
    this.paises.set(formData.paises);
    this.estados.set(formData.estados);
    this.municipios.set(formData.municipios);

    if (formData.cliente) {
      this.modo.set('edicao');
      this.preencherFormulario(formData.cliente);
    } else {
      this.modo.set('novo');
      this.inicializarFormularioNovo();
    }
    
    this.carregando.set(false);
  }

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
      error: () => {
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
    
    // Garantir que todos os campos estejam untouched e pristine após o reset
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
      
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          const nestedControl = control.get(nestedKey);
          nestedControl?.markAsUntouched();
          nestedControl?.markAsPristine();
        });
      }
    });
    
    this.onPaisChange('BR');
    
    // Garantir que o campo telefone esteja pristine e untouched após onPaisChange
    // O p-inputMask pode marcar o campo como dirty/touched ao renderizar
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const telefoneControl = this.form.get('telefone');
          if (telefoneControl && (telefoneControl.value === '' || telefoneControl.value === null)) {
            telefoneControl.markAsPristine();
            telefoneControl.markAsUntouched();
          }
        });
      });
    } 
  }

  private preencherFormulario(cliente: Cliente): void {
    const dataNascimento = cliente.dataNascimento
      ? new Date(cliente.dataNascimento)
      : null;

    const paisCodigo = this.obterCodigoPaisPorNome(cliente.pais || 'Brasil');

    // Converter estado string (ex: "CE") para ID numérico
    let estadoId: number | string = '';
    if (cliente.endereco.estado) {
      const estadoEncontrado = this.estados().find(e => 
        e.sigla === cliente.endereco.estado || 
        e.nome === cliente.endereco.estado ||
        e.id.toString() === cliente.endereco.estado.toString()
      );
      estadoId = estadoEncontrado ? estadoEncontrado.id : '';
    }

    // Primeiro atualizar o país para carregar os estados filtrados
    this.form.get('pais')?.setValue(paisCodigo, { emitEvent: false });
    this.onPaisChange(paisCodigo);
    
    // Preencher tipoContato e telefone primeiro
    this.form.get('tipoContato')?.setValue(cliente.tipoContato || 'Whatsapp', { emitEvent: false });
    this.form.get('telefone')?.setValue(cliente.telefone || '', { emitEvent: false });
    
    // Preencher o restante do formulário (sem estado ainda)
    this.form.patchValue({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      cpf: cliente.cpf,
      dataNascimento,
      endereco: {
        cep: cliente.endereco.cep,
        logradouro: cliente.endereco.logradouro,
        numero: cliente.endereco.numero,
        complemento: cliente.endereco.complemento || '',
        bairro: cliente.endereco.bairro
      },
      ativo: cliente.ativo
    }, { emitEvent: false });
    
    // Preencher estado após os estados serem filtrados
    if (estadoId) {
      this.form.get('endereco.estado')?.setValue(estadoId, { emitEvent: false });
      this.onEstadoChange(estadoId);
      
      // Preencher a cidade após os municípios estarem carregados
      const municipiosCarregados = this.municipiosFiltrados();
      if (municipiosCarregados.length > 0) {
        const municipioEncontrado = municipiosCarregados.find(m => m.nome === cliente.endereco.cidade);
        if (municipioEncontrado) {
          this.form.get('endereco.cidade')?.setValue(cliente.endereco.cidade, { emitEvent: false });
        } else {
          // Se não encontrou, tentar preencher mesmo assim (pode ser que o nome seja diferente)
          this.form.get('endereco.cidade')?.setValue(cliente.endereco.cidade, { emitEvent: false });
        }
      } else {
        // Se não há municípios carregados ainda, preencher mesmo assim
        this.form.get('endereco.cidade')?.setValue(cliente.endereco.cidade, { emitEvent: false });
      }
    }
    
    // Atualizar máscara do telefone após preencher tudo
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
      return;
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
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Não foi possível salvar os dados do cliente.'
          });
        }
      });
  }


  voltarParaLista(): void {
    this.router.navigate(['/clientes']);
  }

  preencherComDadosAleatorios(): void {
    const nomes = ['Ana', 'Bruno', 'Carlos', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Isabela', 'João', 'Kátia', 'Leonardo', 'Mariana', 'Nicolas', 'Olivia', 'Pedro'];
    const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Lima', 'Costa', 'Pereira', 'Carvalho', 'Gomes', 'Martins', 'Ribeiro', 'Almeida', 'Lopes'];
    const tiposContato = ['Residencial', 'Fixo', 'Whatsapp'];
    const logradouros = ['Rua', 'Avenida', 'Praça', 'Travessa', 'Alameda', 'Estrada'];
    const nomesLogradouros = ['das Flores', 'do Comércio', 'Principal', 'Central', 'Nova', 'Velha', 'Brasil', 'Independência', 'Liberdade', 'República'];
    const bairros = ['Centro', 'Jardim América', 'Vila Nova', 'Bela Vista', 'São José', 'Industrial', 'Residencial', 'Comercial', 'Universitário', 'Praia'];
    
    const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Gerar dados pessoais aleatórios
    const nome = `${randomItem(nomes)} ${randomItem(sobrenomes)}`;
    // Remover acentos e caracteres especiais do email
    const emailBase = nome.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '.'); // Substitui espaços por pontos
    const email = `${emailBase}${randomNum(1, 999)}@exemplo.com`;
    const cpf = `${randomNum(100, 999)}.${randomNum(100, 999)}.${randomNum(100, 999)}-${randomNum(10, 99)}`;
    const tipoContato = randomItem(tiposContato);
    const nascimento = new Date(randomNum(1970, 2000), randomNum(0, 11), randomNum(1, 28));
    
    // Gerar telefone aleatório baseado no tipo
    let telefone: string;
    if (tipoContato === 'Whatsapp') {
      telefone = `(${randomNum(11, 99)}) 9${randomNum(1000, 9999)}-${randomNum(1000, 9999)}`;
    } else {
      telefone = `(${randomNum(11, 99)}) ${randomNum(1000, 9999)}-${randomNum(1000, 9999)}`;
    }
    
    // Selecionar estado e cidade aleatórios
    const estadosDisponiveis = this.estadosFiltrados().length > 0 
      ? this.estadosFiltrados() 
      : this.estados().filter(e => e.paisId === this.paises().find(p => p.codigo === 'BR')?.id);
    
    if (estadosDisponiveis.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Carregue os dados de localização antes de preencher aleatoriamente.'
      });
      return;
    }
    
    const estadoSelecionado = randomItem(estadosDisponiveis);
    const municipiosDoEstado = this.municipios().filter(m => m.estadoId === estadoSelecionado.id);
    const cidadeSelecionada = municipiosDoEstado.length > 0 
      ? randomItem(municipiosDoEstado).nome 
      : 'Cidade Aleatória';
    
    // Gerar CEP aleatório (formato brasileiro)
    const cep = `${randomNum(10, 99)}.${randomNum(100, 999)}-${randomNum(100, 999)}`;
    
    // Gerar endereço aleatório
    const logradouro = `${randomItem(logradouros)} ${randomItem(nomesLogradouros)}`;
    const numero = randomNum(1, 9999).toString();
    const complemento = randomNum(0, 3) === 0 ? '' : randomNum(0, 1) === 0 ? `Apto ${randomNum(1, 500)}` : `Bloco ${randomNum(1, 10)}`;
    const bairro = randomItem(bairros);
    
    // Preencher país primeiro para garantir que a máscara seja configurada
    this.form.get('pais')?.setValue('BR', { emitEvent: false });
    this.onPaisChange('BR');
    
    // Preencher tipoContato primeiro
    this.form.get('tipoContato')?.setValue(tipoContato, { emitEvent: false });
    
    // Atualizar máscara do telefone ANTES de preencher o valor
    this.atualizarTelefoneMask();
    
    // Preencher o restante do formulário (sem telefone ainda)
    this.form.patchValue({
      nome,
      email,
      cpf,
      dataNascimento: nascimento,
      tipoContato,
      endereco: {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade: cidadeSelecionada,
        estado: estadoSelecionado.id
      }
    }, { emitEvent: false });
    
    // Atualizar municípios após selecionar estado
    this.onEstadoChange(estadoSelecionado.id);
    
    // Garantir que a máscara esteja correta antes de preencher o telefone
    this.atualizarTelefoneMask();
    
    // Preencher telefone por último, após tudo estar configurado
    // Usar requestAnimationFrame duplo para garantir que o componente p-inputMask esteja totalmente renderizado
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const telefoneControl = this.form.get('telefone');
          if (telefoneControl) {
            telefoneControl.setValue(telefone, { emitEvent: false });
            // Garantir que a máscara esteja correta após preencher
            this.atualizarTelefoneMask();
          }
        });
      });
    } else {
      this.form.get('telefone')?.setValue(telefone, { emitEvent: false });
      this.atualizarTelefoneMask();
    }
  }

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

    const tipoContato = this.form.get('tipoContato')?.value;
    const digits = (telefoneControl.value || '').replace(/\D/g, '');
    
    // Determinar máscara baseado no tipo de contato ou no número de dígitos
    if (tipoContato === 'Whatsapp') {
      this.telefoneMask.set('(99) 9 9999-9999');
    } else if (tipoContato === 'Residencial' || tipoContato === 'Fixo') {
      this.telefoneMask.set('(99) 9999-9999');
    } else {
      // Fallback: usar número de dígitos se tipo não estiver definido
      this.telefoneMask.set(
        digits.length > 10 ? '(99) 9 9999-9999' : '(99) 9999-9999'
      );
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
