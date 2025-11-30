import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appTelefoneFormat]',
  standalone: true
})
export class TelefoneFormatDirective {
  @HostBinding('textContent') textoFormatado: string = '';

  @Input('appTelefoneFormat')
  set telefone(value: string | null | undefined) {
    if (!value) {
      this.textoFormatado = '';
      return;
    }
    const apenasDigitos = value.replace(/\D/g, '');
    this.textoFormatado = apenasDigitos.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
}


