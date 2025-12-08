import { tap } from 'rxjs/operators';
import { LoggerService } from '@infraestrutura/services/logger.service';

export function LogOperation(
  acao: string | ((args: any[], result: any) => string),
  mensagemFn?: (args: any[], result: any) => string
) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args).pipe(
        tap((result) => {
          const logger = LoggerService.instance;
          const acaoCalculada = typeof acao === 'function' ? acao(args, result) : acao;
          if (logger) {
            const mensagem = mensagemFn
              ? mensagemFn(args, result)
              : `Operação ${acaoCalculada} realizada com sucesso`;

            logger.registrar(acaoCalculada, mensagem);
          } else {
            console.warn('LoggerService não instanciado');
          }
        })
      );
    };

    return descriptor;
  };
}

