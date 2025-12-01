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
 * Diretiva para formatação de telefone em elementos de template
 * Funciona dentro de pTemplate="item" do PrimeNG
 */
@Directive({
  selector: '[appTelefoneFormat]',
  standalone: true
})
export class TelefoneFormatDirective implements OnInit, OnChanges {

  /**
   * Método estático para formatação de telefone
   * Pode ser chamado diretamente sem instância da diretiva
   */
  static formatarTelefone(valor: string, mascarado: boolean = false): string {
    if (!valor) {
      return '';
    }

    const digitos = valor.replace(/\D/g, '');
    if (digitos.length === 11) {
      if (mascarado) {
        // Telefone mascarado: (85) 9****-0259
        return `(${digitos.slice(0, 2)}) 9****-${digitos.slice(7)}`;
      }
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
    }

    if (digitos.length === 10) {
      if (mascarado) {
        // Para telefone de 10 dígitos, adapta a máscara
        return `(${digitos.slice(0, 2)}) ****-${digitos.slice(6)}`;
      }
      return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
    }

    return valor;
  }
  @Input('appTelefoneFormat')
  set telefone(value: string | null | undefined) {
    this.updateContent(value);
  }

  @Input()
  set telefoneMascarado(value: boolean) {
    this.mascarado = value;
    // Reaplica a formatação com a nova configuração
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

    // Verifica se é um componente PrimeNG complexo
    const isPrimeComponent = this.isPrimeNGComponent(element);

    this.isInputElement = element.tagName === 'INPUT' ||
                         element.tagName === 'TEXTAREA' ||
                         element.classList?.contains('p-inputtext') ||
                         element.classList?.contains('p-autocomplete-input');

    if (this.isInputElement && !isPrimeComponent) {
      this.setupInputElement();
    } else if (!this.isInputElement) {
      // Para elementos não-input (como spans na tabela), configura observação de mudanças
      this.setupContentObserver();
    }
    // Para componentes PrimeNG, não faz nada - deixa o componente gerenciar
  }

  private isPrimeNGComponent(element: any): boolean {
    // Verifica se o elemento ou seus pais são componentes PrimeNG
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
    // Se recebeu valor via @Input, processa
    if (changes['telefone'] && changes['telefone'].currentValue) {
      this.updateContent(changes['telefone'].currentValue);
    }
  }

  private setupContentObserver() {
    // Usa MutationObserver para detectar mudanças no textContent
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

    // Fallback: tenta processar após um pequeno delay
    setTimeout(() => {
      const textContent = element.textContent?.trim();
      if (textContent && !element.hasAttribute('data-formatted')) {
        this.updateContent(textContent);
      }
    }, 0);
  }

  private setupInputElement() {
    const element = this.elementRef.nativeElement;

    // Formata durante a digitação
    this.renderer.listen(element, 'input', (event) => {
      const input = event.target as HTMLInputElement;
      const rawValue = input.value.replace(/\D/g, '');
      const formattedValue = this.formatTelefone(rawValue);

      if (input.value !== formattedValue) {
        input.value = formattedValue;
      }
    });

    // Processa valor inicial se houver
    if (element.value) {
      const formattedValue = this.formatTelefone(element.value);
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

    const formatted = this.formatTelefone(value, this.mascarado);

    if (this.isInputElement) {
      if (element.value !== formatted) {
        element.value = formatted;
      }
    } else {
      this.renderer.setProperty(element, 'textContent', formatted);
      this.renderer.setAttribute(element, 'data-formatted', 'true');
      // Adiciona atributo para tooltip mostrar valor completo apenas se hoverRevela for true
      if (this.hoverRevela) {
        this.renderer.setAttribute(element, 'data-tooltip', TelefoneFormatDirective.formatarTelefone(value, false));
      } else {
        this.renderer.removeAttribute(element, 'data-tooltip');
      }
    }
  }

  private formatTelefone(value: string, mascarado: boolean = false): string {
    return TelefoneFormatDirective.formatarTelefone(value, mascarado);
  }
}