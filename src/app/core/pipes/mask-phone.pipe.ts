import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskPhone',
  standalone: true
})
export class MaskPhonePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }

    const digitos = value.replace(/\D/g, '');
    if (digitos.length === 11) {
      // Telefone mascarado: (85) 9****-0259
      return `(${digitos.slice(0, 2)}) 9****-${digitos.slice(7)}`;
    }

    if (digitos.length === 10) {
      // Para telefone de 10 dígitos, adapta a máscara
      return `(${digitos.slice(0, 2)}) ****-${digitos.slice(6)}`;
    }

    return value;
  }

}
