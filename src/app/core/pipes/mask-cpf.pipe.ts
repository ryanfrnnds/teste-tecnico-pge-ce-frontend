import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskCpf',
  standalone: true
})
export class MaskCpfPipe implements PipeTransform {

  transform(value: string): string {
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
