export enum ClienteStatusEnum {
  ATIVO = 'Ativo',
  INATIVO = 'Inativo'
}

export type ClienteStatusSeverity = 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined;

export namespace ClienteStatusEnum {
  export function texto(ativo: boolean): string {
    return ativo ? ClienteStatusEnum.ATIVO : ClienteStatusEnum.INATIVO;
  }

  export function severidade(ativo: boolean): ClienteStatusSeverity {
    return ativo ? 'success' : 'secondary';
  }
}


