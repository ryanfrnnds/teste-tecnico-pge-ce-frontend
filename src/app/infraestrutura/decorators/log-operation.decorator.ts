import { tap } from 'rxjs/operators';
import { LoggerService } from '@infraestrutura/services/logger.service';

export function LogOperation(acao: string, mensagemFn?: (args: any[], result: any) => string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      return originalMethod.apply(this, args).pipe(
        tap((result) => {
          const logger = LoggerService.instance;
          if (logger) {
            const mensagem = mensagemFn 
              ? mensagemFn(args, result) 
              : `Operação ${acao} realizada com sucesso`;
            
            logger.registrar(acao, mensagem);
          } else {
            console.warn('LoggerService não instanciado');
          }
        })
      );
    };

    return descriptor;
  };
}

