import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appCpfFormat]',
  standalone: true
})
export class CpfFormatDirective {
  @HostBinding('textContent') textoFormatado: string = '';

  @Input('appCpfFormat')
  set cpf(value: string | null | undefined) {
    if (!value) {
      this.textoFormatado = '';
      return;
    }
    const apenasDigitos = value.replace(/\D/g, '');
    this.textoFormatado = apenasDigitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}


