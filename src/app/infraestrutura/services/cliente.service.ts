import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Cliente } from '@dominio/models/cliente.model';
import { LogOperation } from '@infraestrutura/decorators/log-operation.decorator';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
/**
 * Serviço responsável por gerenciar operações CRUD de clientes.
 * Implementa soft delete através do campo 'ativo' e integra logging automático.
 */
export class ClienteService {
  private apiUrl = '/api/clientes';

  constructor(private http: HttpClient, private logger: LoggerService) {}

  /**
   * Lista todos os clientes do sistema.
   * @param headers Headers HTTP opcionais para a requisição
   * @returns Observable com array de clientes
   */
  listar(headers?: { [key: string]: string }): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl, { headers });
  }

  /**
   * Busca clientes filtrando por um campo específico.
   * Utiliza operador _like do json-server para busca parcial.
   *
   * @param campo Campo do cliente para filtrar ('nome', 'cpf', 'email', etc.)
   * @param termo Termo de busca
   * @param headers Headers HTTP opcionais
   * @returns Observable com array de clientes filtrados
   *
   * @example
   * buscarPorCampo('nome', 'João') // Busca clientes com nome contendo 'João'
   * buscarPorCampo('endereco.cidade', 'São Paulo') // Busca por cidade
   */
  buscarPorCampo(campo: string, termo: string, headers?: { [key: string]: string }): Observable<Cliente[]> {
    const params = new HttpParams().set(`${campo}_like`, termo);
    return this.http.get<Cliente[]>(this.apiUrl, { params, headers });
  }

  /**
   * Busca clientes por nome com lógica inteligente:
   * - Se o termo contém espaço: busca exata pela combinação completa
   * - Se o termo não contém espaço: busca por qualquer palavra que contenha o termo
   */
  buscarPorNomeInteligente(termo: string, headers?: { [key: string]: string }): Observable<Cliente[]> {
    // Converte tudo para minúsculo para comparação case insensitive
    const termoLower = termo.toLowerCase().trim();

    // Busca todos os clientes e filtra no frontend com lógica inteligente
    return this.listar(headers).pipe(
      map(clientes => {
        if (termoLower.includes(' ')) {
          // Se tem espaço, dividir o termo em partes e verificar se cada parte
          // está presente em alguma palavra do nome
          const partesTermo = termoLower.split(/\s+/).filter(p => p.length > 0);

          return clientes.filter(cliente => {
            const nomeLower = cliente.nome.toLowerCase();
            const palavrasNome = nomeLower.split(/\s+/);

            // Verificar se cada parte do termo está presente em alguma palavra do nome
            // (case insensitive - tudo já convertido para minúsculo)
            return partesTermo.every(parteTermo =>
              palavrasNome.some(palavraNome => palavraNome.includes(parteTermo))
            );
          });
        } else {
          // Se não tem espaço, busca por qualquer palavra que contenha o termo
          return clientes.filter(cliente => {
            const nomeLower = cliente.nome.toLowerCase();
            const palavras = nomeLower.split(/\s+/);
            return palavras.some(palavra => palavra.includes(termoLower));
          });
        }
      })
    );
  }

  /**
   * Busca clientes aplicando múltiplos filtros e paginação no backend.
   * Remove automaticamente formatação de CPF e telefone antes da busca.
   *
   * @param filtros Objeto com os filtros a aplicar
   * @param filtros.nome Filtro por nome (busca parcial)
   * @param filtros.cidade Filtro por cidade (busca parcial)
   * @param filtros.status Filtro por status: 'todos', 'ativos' ou 'inativos'
   * @param filtros.pagina Número da página (0-based)
   * @param filtros.limite Quantidade de registros por página
   * @returns Observable com array de clientes e total de registros
   */
  buscarComFiltros(filtros: {
    nome?: string;
    cidade?: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    status?: 'todos' | 'ativos' | 'inativos';
    pagina?: number;
    limite?: number;
  }): Observable<{ clientes: Cliente[]; total: number }> {
    // Limpa formatação dos filtros antes de processar
    const filtrosLimpos = this.limparFormatacaoFiltros(filtros);

    let params = new HttpParams();

    // Adiciona filtros (já limpos de formatação)
    if (filtrosLimpos.nome) params = params.set('nome_like', filtrosLimpos.nome);
    if (filtrosLimpos.cpf) params = params.set('cpf_like', filtrosLimpos.cpf);
    if (filtrosLimpos.email) params = params.set('email_like', filtrosLimpos.email);
    if (filtrosLimpos.telefone) params = params.set('telefone_like', filtrosLimpos.telefone);

    // Filtro de cidade (case insensitive com contains)
    if (filtros.cidade) {
      // json-server já faz case insensitive e contains com _like
      params = params.set('endereco.cidade_like', filtros.cidade);
    }

    // Filtro de status
    if (filtros.status && filtros.status !== 'todos') {
      const ativo = filtros.status === 'ativos' ? 'true' : 'false';
      params = params.set('ativo', ativo);
    }
    // Para status 'todos', não aplicamos nenhum filtro (já que queremos todos os registros)

    // Ordenação padrão por nome
    params = params.set('_sort', 'nome');
    params = params.set('_order', 'asc');

    // Paginação (json-server usa 1-based indexing)
    if (filtros.pagina !== undefined && filtros.pagina >= 0) {
      params = params.set('_page', (filtros.pagina + 1).toString());
    }
    if (filtros.limite && filtros.limite > 0) {
      params = params.set('_limit', filtros.limite.toString());
    }

    return this.http.get<Cliente[]>(this.apiUrl, {
      params,
      observe: 'response'
    }).pipe(
      map(response => {
        const clientes = response.body || [];
        const total = parseInt(response.headers.get('x-total-count') || '0', 10);
        return { clientes, total };
      })
    );
  }

  /**
   * Busca clientes por cidade e/ou estado combinados (Cidade - Estado).
   */
  buscarPorLocalizacao(termo: string, headers?: { [key: string]: string }): Observable<Cliente[]> {
    const params = new HttpParams().set('q', termo);
    return this.http.get<Cliente[]>(`${this.apiUrl}/localizacao`, { params, headers });
  }

  /**
   * Busca um cliente específico pelo ID.
   * @param id Identificador único do cliente
   * @returns Observable com dados do cliente
   */
  buscarPorId(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo cliente no sistema.
   * Registra automaticamente a operação no log de auditoria.
   *
   * @param cliente Dados completos do cliente a ser criado
   * @returns Observable com cliente criado (incluindo ID gerado)
   */
  @LogOperation('CRIACAO', (args) => `Cliente ${args[0].nome} criado`)
  criar(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  /**
   * Atualiza dados específicos de um cliente (PATCH).
   * Registra operação no log baseada no tipo de alteração.
   * Suporta reativação/desativação automática via campo 'ativo'.
   *
   * @param id Identificador do cliente
   * @param cliente Campos a serem atualizados
   * @returns Observable com cliente atualizado
   */
  @LogOperation('ATUALIZACAO', (args, result) => {
    const changes = args[1];
    const cliente = result; // Cliente retornado após atualização
    if (changes.ativo === true) {
      return `Cliente "${cliente.nome}" foi reativado`;
    } else if (changes.ativo === false) {
      return `Cliente "${cliente.nome}" foi desativado`;
    }
    return `Cliente "${cliente.nome}" teve dados atualizados`;
  })
  atualizar(id: string, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  /**
   * Atualiza todos os dados de um cliente (PUT).
   * Registra operação no log de auditoria.
   *
   * @param cliente Dados completos do cliente para atualização
   * @returns Observable com cliente atualizado
   */
  @LogOperation('ATUALIZACAO', (args) => `Cliente ${args[0].id} atualizado`)
  atualizarCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${cliente.id}`, cliente);
  }

  /**
   * Desativa um cliente (soft delete).
   * Mantém o registro no banco mas marca como inativo.
   * Registra operação no log de auditoria.
   *
   * @param id Identificador do cliente a ser desativado
   * @returns Observable com cliente desativado
   */
  @LogOperation('EXCLUSAO', (args, result) => {
    const cliente = result; // Cliente retornado após desativação
    return `Cliente "${cliente.nome}" foi desativado`;
  })
  excluir(id: string): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.apiUrl}/${id}`, { ativo: false });
  }
  
  /**
   * Retorna o total de registros de clientes no sistema, independentemente de status ou filtros.
   */
  contarTotalGeral(): Observable<number> {
    // json-server retorna o total no header x-total-count
    // Usamos _page=1&_limit=1 para garantir comportamento padrão de paginação
    const params = new HttpParams().set('_page', '1').set('_limit', '1');
    return this.http.get<Cliente[]>(this.apiUrl, { params, observe: 'response' }).pipe(
      map(response => {
        const totalHeader = response.headers.get('X-Total-Count') || response.headers.get('x-total-count');
        if (totalHeader) {
          return parseInt(totalHeader, 10);
        }
        // Fallback: se não vier header, mas vier corpo, assume que o backend ignorou paginação
        // e retornou tudo (comportamento possível em alguns proxies/setups)
        if (response.body && Array.isArray(response.body)) {
            return response.body.length;
        }
        return 0;
      })
    );
  }
  limparBaseDeDados(): Observable<void> {
    return this.listar().pipe(
      switchMap(clientes => {
        if (clientes.length === 0) return of(undefined);
        const deleteObservables = clientes.map(c => 
          this.http.delete(`${this.apiUrl}/${c.id}`)
        );
        return forkJoin(deleteObservables).pipe(map(() => undefined));
      })
    );
  }

  /**
   * Endpoint de mock para popular a base com 20 clientes aleatórios.
   */
  popularMockClientes(): Observable<Cliente[]> {
    return this.http.post<Cliente[]>('/api/mock/clientes/popular', {});
  }

  /**
   * Remove formatação visual dos filtros antes de enviar para o backend
   * @param filtros Filtros com possível formatação visual
   * @returns Filtros com formatação removida
   */
  private limparFormatacaoFiltros(filtros: {
    nome?: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    localizacao?: string;
    status?: 'todos' | 'ativos' | 'inativos';
    pagina?: number;
    limite?: number;
  }): typeof filtros {
    return {
      ...filtros,
      cpf: filtros.cpf ? filtros.cpf.replace(/\D/g, '') : filtros.cpf,
      telefone: filtros.telefone ? filtros.telefone.replace(/\D/g, '') : filtros.telefone,
    };
  }
}
