export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  tipoContato?: 'Residencial' | 'Fixo' | 'Whatsapp';
  dataNascimento?: string;
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

