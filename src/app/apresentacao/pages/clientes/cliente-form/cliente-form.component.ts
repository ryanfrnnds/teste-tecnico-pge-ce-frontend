import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';

import { ClienteFormStore } from './cliente-form.store';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    SelectModule,
    CalendarModule,
    ButtonModule,
    FloatLabelModule,
    InputMaskModule
  ],
  providers: [ClienteFormStore],
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss']
})
export class ClienteFormComponent implements OnInit, AfterViewInit {
  readonly store = inject(ClienteFormStore);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const formData = this.route.snapshot.data['formData'] as { cliente: any; paises: any[]; estados: any[]; municipios: any[] } | undefined;
    const id = this.route.snapshot.paramMap.get('id');
    
    if (formData) {
      // Usar dados do resolver
      this.store.initComDados(id, formData);
    } else {
      // Fallback para quando não há resolver (novo cliente)
      this.store.init(id);
    }
  }

  ngAfterViewInit(): void {
    // Garantir que o campo telefone não seja marcado como touched ou dirty após a renderização
    // O p-inputMask pode marcar o campo como dirty ao renderizar, então precisamos resetar
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const telefoneControl = this.store.form.get('telefone');
          if (telefoneControl) {
            // Se o campo está vazio e foi marcado como dirty pelo componente, resetar
            const valor = telefoneControl.value;
            if ((valor === '' || valor === null || valor === undefined) && telefoneControl.dirty) {
              telefoneControl.markAsPristine();
              telefoneControl.markAsUntouched();
            }
          }
        });
      });
    }
  }

  get form() { return this.store.form; }

  get nome(): FormControl {
    return this.store.form.get('nome') as FormControl;
  }

  get email(): FormControl {
    return this.store.form.get('email') as FormControl;
  }

  get cpf(): FormControl {
    return this.store.form.get('cpf') as FormControl;
  }

  get dataNascimento(): FormControl {
    return this.store.form.get('dataNascimento') as FormControl;
  }

  get telefone(): FormControl {
    return this.store.form.get('telefone') as FormControl;
  }

  get pais(): FormControl {
    return this.store.form.get('pais') as FormControl;
  }

  get enderecoGroup(): FormGroup {
    return this.store.form.get('endereco') as FormGroup;
  }

  get estado(): FormControl {
    return this.enderecoGroup.get('estado') as FormControl;
  }

  get cidade(): FormControl {
    return this.enderecoGroup.get('cidade') as FormControl;
  }

  get cep(): FormControl {
    return this.enderecoGroup.get('cep') as FormControl;
  }

  get logradouro(): FormControl {
    return this.enderecoGroup.get('logradouro') as FormControl;
  }

  get numero(): FormControl {
    return this.enderecoGroup.get('numero') as FormControl;
  }

  get bairro(): FormControl {
    return this.enderecoGroup.get('bairro') as FormControl;
  }
  
  get complemento(): FormControl {
    return this.enderecoGroup.get('complemento') as FormControl;
  }
}
