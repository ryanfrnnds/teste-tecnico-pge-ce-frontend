import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Renderer2
} from '@angular/core';

/**
 * Diretiva para formatação de email em elementos de template
 * Com suporte a máscara parcial para proteção de dados
 */
@Directive({
  selector: '[appEmailFormat]',
  standalone: true
})
export class EmailFormatDirective implements OnInit, OnChanges {

  /**
   * Método estático para formatação de email
   * Pode ser chamado diretamente sem instância da diretiva
   */
  static formatarEmail(valor: string, mascarado: boolean = false): string {
    if (!valor) {
      return '';
    }

    if (mascarado) {
      const partes = valor.split('@');
      if (partes.length === 2) {
        const nome = partes[0];
        const dominio = partes[1];

        if (nome.length > 0) {
          const primeiraLetra = nome.charAt(0);
          const resto = nome.slice(1);
          const nomeMascarado = primeiraLetra + '****';

          const partesNome = nome.split('.');
          if (partesNome.length > 1) {
            const primeiraParte = partesNome[0];
            const segundaParte = partesNome[1];
            const primeiraLetraSegunda = segundaParte.charAt(0);
            return `${primeiraParte.charAt(0)}****.${primeiraLetraSegunda}****@${dominio}`;
          }

          return `${nomeMascarado}@${dominio}`;
        }
      }
    }

    return valor;
  }

  @Input('appEmailFormat')
  set email(value: string | null | undefined) {
    this.updateContent(value);
  }

  @Input()
  set emailMascarado(value: boolean) {
    this.mascarado = value;
    if (this.ultimoValor) {
      this.updateContent(this.ultimoValor);
    }
  }

  @Input()
  set mostrarMascaraHover(value: boolean) {
    this.hoverRevela = value;
  }

  private hoverRevela: boolean = true;

  private mascarado: boolean = false;
  private ultimoValor: string | null | undefined = null;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const element = this.elementRef.nativeElement;

    if (element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
      this.setupContentObserver();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['email'] && changes['email'].currentValue) {
      this.updateContent(changes['email'].currentValue);
    }
  }

  private setupContentObserver() {
    const element = this.elementRef.nativeElement;

    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const textContent = element.textContent?.trim();
            if (textContent && !element.hasAttribute('data-formatted')) {
              this.updateContent(textContent);
            }
          }
        });
      });

      observer.observe(element, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    setTimeout(() => {
      const textContent = element.textContent?.trim();
      if (textContent && !element.hasAttribute('data-formatted')) {
        this.updateContent(textContent);
      }
    }, 0);
  }

  private updateContent(value: string | null | undefined) {
    const element = this.elementRef.nativeElement;
    this.ultimoValor = value;

    if (!value) {
      this.renderer.setProperty(element, 'textContent', '');
      return;
    }

    const formatted = EmailFormatDirective.formatarEmail(value, this.mascarado);

    this.renderer.setProperty(element, 'textContent', formatted);
    this.renderer.setAttribute(element, 'data-formatted', 'true');
    if (this.hoverRevela) {
      this.renderer.setAttribute(element, 'data-tooltip', EmailFormatDirective.formatarEmail(value, false));
    } else {
      this.renderer.removeAttribute(element, 'data-tooltip');
    }
  }
}

/**
 * Diretiva para formatação de CPF em elementos de template
 * Funciona dentro de pTemplate="item" do PrimeNG
 */
@Directive({
  selector: '[appCpfFormat]',
  standalone: true
})
export class CpfFormatDirective implements OnInit, OnChanges {

  /**
   * Método estático para formatação de CPF
   * Pode ser chamado diretamente sem instância da diretiva
   */
  static formatarCpf(valor: string, mascarado: boolean = false): string {
    if (!valor) {
      return '';
    }

    const digitos = valor.replace(/\D/g, '');
    if (digitos.length !== 11) {
      return valor;
    }

    if (mascarado) {
      return `***.***.***-${digitos.slice(9)}`;
    }

    return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  }
  @Input('appCpfFormat')
  set cpf(value: string | null | undefined) {
    this.updateContent(value);
  }

  @Input()
  set cpfMascarado(value: boolean) {
    this.mascarado = value;
    if (this.ultimoValor) {
      this.updateContent(this.ultimoValor);
    }
  }

  @Input()
  set mostrarMascaraHover(value: boolean) {
    this.hoverRevela = value;
  }

  private hoverRevela: boolean = true;

  private mascarado: boolean = false;
  private ultimoValor: string | null | undefined = null;

  private isInputElement: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const element = this.elementRef.nativeElement;

    const isPrimeComponent = this.isPrimeNGComponent(element);

    this.isInputElement = element.tagName === 'INPUT' ||
                         element.tagName === 'TEXTAREA' ||
                         element.classList?.contains('p-inputtext') ||
                         element.classList?.contains('p-autocomplete-input');

    if (this.isInputElement && !isPrimeComponent) {
      this.setupInputElement();
    } else if (!this.isInputElement) {
      this.setupContentObserver();
    }
  }

  private isPrimeNGComponent(element: any): boolean {
    let current = element;
    while (current) {
      if (current.classList?.contains('p-autocomplete') ||
          current.classList?.contains('p-dropdown') ||
          current.classList?.contains('p-multiselect') ||
          current.tagName?.toLowerCase().includes('p-')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cpf'] && changes['cpf'].currentValue) {
      this.updateContent(changes['cpf'].currentValue);
    }
  }

  private setupContentObserver() {
    const element = this.elementRef.nativeElement;

    if (typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const textContent = element.textContent?.trim();
            if (textContent && !element.hasAttribute('data-formatted')) {
              this.updateContent(textContent);
            }
          }
        });
      });

      observer.observe(element, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    setTimeout(() => {
      const textContent = element.textContent?.trim();
      if (textContent && !element.hasAttribute('data-formatted')) {
        this.updateContent(textContent);
      }
    }, 0);
  }

  private setupInputElement() {
    const element = this.elementRef.nativeElement;

    this.renderer.listen(element, 'input', (event) => {
      const input = event.target as HTMLInputElement;
      const rawValue = input.value.replace(/\D/g, '');
      const formattedValue = this.formatCpf(rawValue);

      if (input.value !== formattedValue) {
        input.value = formattedValue;
      }
    });

    if (element.value) {
      const formattedValue = this.formatCpf(element.value);
      if (element.value !== formattedValue) {
        element.value = formattedValue;
      }
    }
  }

  private updateContent(value: string | null | undefined) {
    const element = this.elementRef.nativeElement;
    this.ultimoValor = value;

    if (!value) {
      if (this.isInputElement) {
        element.value = '';
      } else {
        this.renderer.setProperty(element, 'textContent', '');
      }
      return;
    }

    const formatted = this.formatCpf(value, this.mascarado);

    if (this.isInputElement) {
      if (element.value !== formatted) {
        element.value = formatted;
      }
    } else {
      this.renderer.setProperty(element, 'textContent', formatted);
      this.renderer.setAttribute(element, 'data-formatted', 'true');
      if (this.hoverRevela) {
        this.renderer.setAttribute(element, 'data-tooltip', CpfFormatDirective.formatarCpf(value, false));
      } else {
        this.renderer.removeAttribute(element, 'data-tooltip');
      }
    }
  }

  private formatCpf(value: string, mascarado: boolean = false): string {
    return CpfFormatDirective.formatarCpf(value, mascarado);
  }
}