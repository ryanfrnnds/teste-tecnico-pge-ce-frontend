export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  /**
   * Tipo do contato principal.
   * Utilizado na tela de cadastro/edição para demonstrar opções de telefone (Residencial/Fixo/Whatsapp).
   */
  tipoContato?: 'Residencial' | 'Fixo' | 'Whatsapp';
  /**
   * Data de nascimento do cliente (ISO string).
   */
  dataNascimento?: string;
  /**
   * País de residência do cliente.
   * Usado para validar obrigatoriedade de CPF quando "Brasil".
   */
  pais?: string;
  endereco: Endereço;
  ativo: boolean;
}

export interface Endereço {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

