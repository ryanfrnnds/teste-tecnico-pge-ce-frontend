import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador para garantir que a data não seja futura.
 */
export function dataNaoFuturaValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const data = value instanceof Date ? value : new Date(value);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  if (data > hoje) {
    return { dataFutura: true };
  }
  return null;
}

/**
 * Validador básico de formato de CPF (apenas verifica 11 dígitos numéricos).
 */
export function cpfBasicoValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11) {
    return { cpfInvalido: true };
  }
  return null;
}

