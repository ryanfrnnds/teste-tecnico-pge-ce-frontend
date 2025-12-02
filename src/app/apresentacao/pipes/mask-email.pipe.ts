import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskEmail',
  standalone: true
})
export class MaskEmailPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }

    const partes = value.split('@');
    if (partes.length !== 2) {
      return value;
    }

    const nome = partes[0];
    const dominio = partes[1];

    if (nome.length > 0) {
      const primeiraLetra = nome.charAt(0);
      const resto = nome.slice(1);

      // Email mascarado: l****.a****@exemplo.com
      const partesNome = nome.split('.');
      if (partesNome.length > 1) {
        const primeiraParte = partesNome[0];
        const segundaParte = partesNome[1];
        const primeiraLetraSegunda = segundaParte.charAt(0);
        return `${primeiraParte.charAt(0)}****.${primeiraLetraSegunda}****@${dominio}`;
      }

      return `${primeiraLetra}****@${dominio}`;
    }

    return value;
  }

}
