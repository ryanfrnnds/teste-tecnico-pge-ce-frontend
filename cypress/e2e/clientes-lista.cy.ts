/// <reference types="cypress" />

/**
 * Testes E2E da Lista de Clientes
 *
 * Premissas:
 * - App rodando em http://localhost:4200
 * - Proxy para /api apontando para json-server OU APIs interceptadas via cy.intercept
 */

const API_CLIENTES = '/api/clientes';
const API_LOGIN = '/api/auth/login';

function mockLogin() {
  cy.intercept('POST', API_LOGIN, {
    statusCode: 200,
    body: {
      token: 'fake-token',
      user: {
        id: 1,
        username: 'admin',
        name: 'Administrador'
      }
    }
  }).as('login');
}

function mockListaClientes(clientes: any[], total: number = clientes.length, queryMatcher: any = {}) {
  cy.intercept('GET', API_CLIENTES + '*', (req) => {
    const hasAllKeys =
      queryMatcher &&
      Object.keys(queryMatcher).length > 0 &&
      Object.keys(queryMatcher).every((key) => req.query[key] !== undefined);

    if (hasAllKeys) {
      Object.entries(queryMatcher).forEach(([key, expected]) => {
        if (expected !== undefined) {
          expect(req.query[key]).to.eq(String(expected));
        }
      });
    }

    req.reply({
      statusCode: 200,
      body: clientes,
      headers: {
        'x-total-count': String(total)
      }
    });
  }).as('buscarClientes');
}

describe('Lista de Clientes - Fluxos principais', () => {
  const clientesMock = [
    {
      id: '1',
      nome: 'Ana Silva',
      cpf: '00111111111',
      email: 'ana.silva@exemplo.com',
      telefone: '8598000000',
      endereco: {
        cidade: 'Fortaleza'
      },
      ativo: true
    },
    {
      id: '2',
      nome: 'Carlos Santos',
      cpf: '00112223334',
      email: 'carlos.santos@exemplo.com',
      telefone: '8598000001',
      endereco: {
        cidade: 'Sobral'
      },
      ativo: false
    }
  ];

  beforeEach(() => {
    mockLogin();
    mockListaClientes(clientesMock);

    cy.visit('/login');

    cy.get('input#username').clear().type('admin');
    cy.get('#password input').type('admin');
    cy.contains('button', 'Entrar').click();

    cy.wait('@login');
    cy.url().should('include', '/clientes');
    cy.wait('@buscarClientes');
  });

  it('Carregar a lista de clientes e exibir tabela com resultados', () => {
    cy.get('.p-datatable tbody tr').should('have.length.at.least', 1);
    cy.contains('.p-datatable tbody tr', 'Ana Silva').should('exist');
  });

  it('Persistência de estado via Query Params (filtros + reload + voltar navegação)', () => {
    mockListaClientes(clientesMock, clientesMock.length, {
      nome_like: 'Ana',
      'endereco.cidade_like': 'Fortaleza'
    });

    cy.get('input#filtroNome').clear().type('Ana{enter}');
    cy.get('input#filtroCidade').clear().type('Fortaleza');

    cy.wait('@buscarClientes');

    cy.url().should('include', 'nome=Ana');
    cy.url().should('include', 'cidade=Fortaleza');

    cy.reload();
    cy.url().should('include', 'nome=Ana');
    cy.get('input#filtroNome').should('have.value', 'Ana');

    cy.visit('/logs');
    cy.go('back');
    cy.url().should('include', '/clientes');
    cy.get('input#filtroNome').should('have.value', 'Ana');
  });

  it('Validação de CPF mascarado na lista', () => {
    cy.get('.p-datatable tbody tr').first().within(() => {
      cy.get('td').eq(1).invoke('text').should((text) => {
        expect(text.trim()).to.match(/\*\*\*.\*\*\*.\*\*\*-\d{2}/);
      });
    });
  });

  it('Paginação - mudança de página e limite atualizam query params', () => {
    // Não validamos os params de backend aqui, apenas o reflection nos query params da URL
    mockListaClientes(clientesMock, 40);

    cy.get('.p-paginator-next').click();
    cy.wait('@buscarClientes');

    cy.url().should('include', 'pagina=10');

    cy.get('.p-paginator-rpp-options .p-dropdown').click();
    cy.get('.p-dropdown-items .p-dropdown-item').contains('20').click();

    cy.url().should('include', 'limite=20');
  });

  it('Filtro por status: ativos / inativos / todos', () => {
    mockListaClientes(
      clientesMock.filter((c) => c.ativo),
      1,
      { ativo: 'true' }
    );

    // botão de "todos", "ativos" e "inativos" estão em ordem no header (tabela desktop)
    cy.get('.desktop-table-container .status-filter-icon').eq(1).click({ force: true });
    cy.wait('@buscarClientes');
    cy.get('.p-datatable tbody tr').should('have.length', 1);

    mockListaClientes(
      clientesMock.filter((c) => !c.ativo),
      1,
      { ativo: 'false' }
    );

    cy.get('.desktop-table-container .status-filter-icon').eq(2).click({ force: true });
    cy.wait('@buscarClientes');
    cy.get('.p-datatable tbody tr').should('have.length', 1);
  });

  it('Exclusão de um cliente', () => {
    cy.intercept('PATCH', `${API_CLIENTES}/1`, {
      statusCode: 200,
      body: { ...clientesMock[0], ativo: false }
    }).as('excluirCliente');

    mockListaClientes(clientesMock);

    cy.contains('.p-datatable tbody tr', 'Ana Silva').within(() => {
      cy.get('button').eq(1).click({ force: true });
    });

    cy.contains('.p-dialog', 'Confirmar Inativação').within(() => {
      cy.contains('button', 'Confirmar').click();
    });

    cy.wait('@excluirCliente');
    cy.wait('@buscarClientes');
  });

  it('Exclusão em massa de clientes selecionados', () => {
    cy.intercept('PATCH', `${API_CLIENTES}/*`, {
      statusCode: 200,
      body: { ...clientesMock[0], ativo: false }
    }).as('excluirEmMassa');

    mockListaClientes(clientesMock, clientesMock.length);

    cy.get('.p-datatable tbody tr').each(($row) => {
      cy.wrap($row).find('input[type="checkbox"]').check({ force: true });
    });

    cy.contains('button', 'Excluir Selecionados').click({ force: true });

    cy.wait('@excluirEmMassa');
  });

  it('Reativação de clientes inativos (fluxo semelhante à exclusão)', () => {
    cy.get('.desktop-table-container .status-filter-icon').eq(2).click({ force: true });

    cy.intercept('PATCH', `${API_CLIENTES}/*`, {
      statusCode: 200,
      body: { ...clientesMock[1], ativo: true }
    }).as('reativarClientes');

    cy.get('.p-datatable tbody tr').first().within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });

    cy.contains('button', 'Reativar Selecionados').click({ force: true });

    cy.wait('@reativarClientes');
  });

  it('Navegação entre telas (editar, visualizar, voltar mantendo estado)', () => {
    mockListaClientes(clientesMock);

    cy.contains('.p-datatable tbody tr', 'Ana Silva').within(() => {
      cy.get('td').first().click({ force: true });
    });

    cy.url().should('include', '/clientes');
    cy.go('back');
    cy.url().should('include', '/clientes');

    cy.contains('.p-datatable tbody tr', 'Ana Silva').within(() => {
      cy.get('button').first().click({ force: true });
    });

    cy.url().should('match', /\/clientes\/1\/editar$/);
    cy.go('back');
    cy.url().should('include', '/clientes');
  });
});


