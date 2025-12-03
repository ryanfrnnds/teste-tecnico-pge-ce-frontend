import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskPhone',
  standalone: true
})
export class MaskPhonePipe implements PipeTransform {

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
    
    if (digitos.length === 11) {
      return `(${digitos.slice(0, 2)}) 9****-${digitos.slice(7)}`;
    }

    if (digitos.length === 10) {
      return `(${digitos.slice(0, 2)}) ****-${digitos.slice(6)}`;
    }

    return value;
  }

}
