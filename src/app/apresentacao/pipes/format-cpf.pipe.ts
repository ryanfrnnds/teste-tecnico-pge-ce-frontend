import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatCpf',
  standalone: true
})
export class FormatCpfPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }

    const digitos = value.replace(/\D/g, '');
    if (digitos.length !== 11) {
      return value;
    }

    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  }

}
