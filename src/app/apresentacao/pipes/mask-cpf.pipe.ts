import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskCpf',
  standalone: true
})
export class MaskCpfPipe implements PipeTransform {

  transform(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value !== 'string') {
      return value;
    }

    if (!value) {
      return '';
    }

    const digitos = value.replace(/\D/g, '');
    if (digitos.length !== 11) {
      return value;
    }

    // CPF mascarado: ***.***.***-10
    return `***.***.***-${digitos.slice(9)}`;
  }

}
