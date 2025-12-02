import { Component, OnInit, inject } from '@angular/core';
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
export class ClienteFormComponent implements OnInit {
  readonly store = inject(ClienteFormStore);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    // Não passamos mais os dados do resolver, apenas o ID
    this.store.init(id);
  }

  // Getters para facilitar uso dos controles no template com a sintaxe @if
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

  // Endereço Controls
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
