/// <reference types="cypress" />

/**
 * Testes E2E da Lista de Clientes
 *
 * Premissas:
 * - App rodando em http://localhost:4200
 * - Proxy para /api apontando para json-server OU APIs interceptadas via cy.intercept
 */
namespace ApiEndpoints {
  export const CLIENTES = '/api/clientes';
  export const LOGIN = '/api/auth/login';
}

function mockLogin() {
  cy.intercept('POST', ApiEndpoints.LOGIN, {
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
  cy.intercept('GET', ApiEndpoints.CLIENTES + '*', (req) => {
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
    
    cy.intercept('GET', '/api/logs*', {
      statusCode: 200,
      body: []
    }).as('logs');
    
    cy.intercept('GET', '/api/clientes?_page=1&_limit=1*', {
      statusCode: 200,
      body: [],
      headers: {
        'x-total-count': String(clientesMock.length)
      }
    }).as('contarTotal');

    cy.visit('/login');

    cy.get('body').then(($body) => {
      if ($body.find('.p-dialog-mask, .confirmation-content, .confirmation-message').length > 0) {
        cy.get('body').then(($body2) => {
          if ($body2.find('.p-dialog-header-close').length > 0) {
            cy.get('.p-dialog-header-close').first().click({ force: true });
          } else if ($body2.find('.p-dialog-footer button').length > 0) {
            cy.get('.p-dialog-footer button').first().click({ force: true });
          } else {
            cy.get('.p-dialog-mask').click({ force: true });
          }
        });
        cy.wait(500);
      }
    });

    cy.get('input[formControlName="username"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[formControlName="username"]').clear({ force: true }).type('admin', { force: true });
    
    cy.wait(300);
    cy.get('body').then(($body) => {
      if ($body.find('.p-dialog-mask, .confirmation-content, .confirmation-message').is(':visible')) {
        cy.get('.p-dialog-mask, .p-dialog-header-close, .p-dialog-footer button').first().click({ force: true });
        cy.wait(500);
      }
    });
    
    cy.get('#password input', { timeout: 10000 }).should('be.visible');
    cy.get('#password input').type('admin', { force: true });
    
    cy.wait(300);
    cy.get('body').then(($body) => {
      if ($body.find('.p-dialog-mask, .p-dialog-footer').is(':visible')) {
        cy.get('.p-dialog-header-close, .p-dialog-footer button').first().click({ force: true });
        cy.wait(500);
      }
    });
    
    cy.get('button[type="submit"]', { timeout: 10000 }).should('be.visible');
    cy.get('button[type="submit"]').click({ force: true });

    cy.wait('@login');
    cy.url().should('include', '/clientes');
    cy.wait('@buscarClientes');
    cy.get('.p-skeleton', { timeout: 10000 }).should('not.exist');
  });

  it('Carregar a lista de clientes e exibir tabela com resultados', () => {
    cy.wait('@buscarClientes');
    cy.get('.p-skeleton', { timeout: 10000 }).should('not.exist');
    cy.wait(500);
    cy.get('body').then(($body) => {
      if ($body.find('.desktop-table-container .p-datatable').length > 0) {
        cy.get('.desktop-table-container .p-datatable', { timeout: 10000 }).should('be.visible');
        cy.get('.desktop-table-container .p-datatable tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
        cy.contains('.desktop-table-container .p-datatable tbody tr', 'Ana Silva').should('exist');
      } else if ($body.find('.mobile-card-container').length > 0) {
        cy.get('.mobile-card-container', { timeout: 10000 }).should('be.visible');
        cy.contains('Ana Silva').should('exist');
      } else {
        cy.get('.p-datatable', { timeout: 10000 }).should('be.visible');
        cy.get('.p-datatable tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
        cy.contains('.p-datatable tbody tr', 'Ana Silva').should('exist');
      }
    });
  });

  it('Persistência de estado via Query Params (filtros + reload + voltar navegação)', () => {
    mockListaClientes(clientesMock, clientesMock.length, {
      nome_like: 'Ana',
      'endereco.cidade_like': 'Fortaleza'
    });

    cy.get('input[formControlName="nome"]').clear().type('Ana{enter}');
    cy.get('input[formControlName="cidade"]').clear().type('Fortaleza');

    cy.wait('@buscarClientes');

    cy.url().should('include', 'nome=Ana');
    cy.url().should('include', 'cidade=Fortaleza');

    mockListaClientes(clientesMock, clientesMock.length, {
      nome_like: 'Ana',
      'endereco.cidade_like': 'Fortaleza'
    });
    mockLogin();

    cy.reload();
    cy.url().should('include', '/clientes');
    cy.wait('@buscarClientes', { timeout: 10000 });
    cy.wait(1000);
    cy.url().should('include', 'nome=Ana');
    cy.get('input[formControlName="nome"]', { timeout: 5000 }).should('have.value', 'Ana');

    mockListaClientes(clientesMock, clientesMock.length, {
      nome_like: 'Ana',
      'endereco.cidade_like': 'Fortaleza'
    });
    mockLogin();

    cy.visit('/logs');
    cy.go('back');
    cy.url().should('include', '/clientes');
    cy.wait('@buscarClientes', { timeout: 10000 });
    cy.wait(1000);
    cy.url().should('include', '/clientes');
    cy.get('input[formControlName="nome"]', { timeout: 5000 }).should('have.value', 'Ana');
  });

  it('Validação de CPF mascarado na lista', () => {
    cy.wait('@buscarClientes');
    cy.get('.p-skeleton', { timeout: 10000 }).should('not.exist');
    cy.wait(500);
    cy.get('body').then(($body) => {
      if ($body.find('.desktop-table-container .p-datatable').length > 0) {
        cy.get('.desktop-table-container .p-datatable', { timeout: 10000 }).should('be.visible');
        cy.get('.desktop-table-container .p-datatable tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
        cy.get('.desktop-table-container .p-datatable tbody tr').first().within(() => {
          cy.get('td').eq(1).invoke('text').should((text) => {
            expect(text.trim()).to.match(/\*\*\*.\*\*\*.\*\*\*-\d{2}/);
          });
        });
      } else {
        cy.get('.p-datatable', { timeout: 10000 }).should('be.visible');
        cy.get('.p-datatable tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
        cy.get('.p-datatable tbody tr').first().within(() => {
          cy.get('td').eq(1).invoke('text').should((text) => {
            expect(text.trim()).to.match(/\*\*\*.\*\*\*.\*\*\*-\d{2}/);
          });
        });
      }
    });
  });

  it('Filtro por status: ativos / inativos / todos', () => {
    mockListaClientes(
      clientesMock.filter((c) => c.ativo),
      1,
      { ativo: 'true' }
    );

    cy.get('.desktop-table-container .p-datatable', { timeout: 10000 }).should('be.visible');
    
    cy.get('.desktop-table-container .status-filter-icon', { timeout: 5000 }).should('have.length.at.least', 3);
    cy.get('.desktop-table-container .status-filter-icon').eq(1).click({ force: true });
    cy.wait('@buscarClientes');
    
    cy.wait(500);
    
    cy.get('.desktop-table-container .p-datatable tbody tr', { timeout: 5000 }).should('have.length', 1);

    mockListaClientes(
      clientesMock.filter((c) => !c.ativo),
      1,
      { ativo: 'false' }
    );

    cy.get('.desktop-table-container .status-filter-icon').eq(2).click({ force: true });
    cy.wait('@buscarClientes');
    
    cy.wait(500);
    
    cy.get('.desktop-table-container .p-datatable tbody tr', { timeout: 5000 }).should('have.length', 1);
  });

  it('Exclusão de um cliente', () => {
    cy.intercept('PATCH', `${ApiEndpoints.CLIENTES}/1`, {
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
    cy.intercept('PATCH', `${ApiEndpoints.CLIENTES}/*`, {
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
    cy.intercept('GET', ApiEndpoints.CLIENTES + '*', {
      statusCode: 200,
      body: clientesMock.filter((c) => !c.ativo),
      headers: {
        'x-total-count': '1'
      }
    }).as('buscarClientesInativos');

    cy.get('.desktop-table-container', { timeout: 10000 }).should('be.visible');
    cy.get('.desktop-table-container .status-filter-icon', { timeout: 5000 }).should('have.length.at.least', 3);
    cy.get('.desktop-table-container .status-filter-icon').eq(2).click({ force: true });
    cy.wait('@buscarClientesInativos');

    cy.intercept('PATCH', `${ApiEndpoints.CLIENTES}/*`, {
      statusCode: 200,
      body: { ...clientesMock[1], ativo: true }
    }).as('reativarClientes');

    cy.get('.p-datatable tbody tr').should('have.length.at.least', 1);
    cy.get('.p-datatable tbody tr').first().within(() => {
      cy.get('input[type="checkbox"]').check({ force: true });
    });

    cy.contains('button', 'Reativar Selecionados').click({ force: true });

    cy.wait('@reativarClientes');
  });

  it('Navegação entre telas (editar, visualizar, voltar mantendo estado)', () => {
    mockListaClientes(clientesMock);
    
    cy.wait('@buscarClientes');
    cy.get('.p-datatable tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);

    cy.contains('.p-datatable tbody tr', 'Ana Silva').should('be.visible');
    cy.contains('.p-datatable tbody tr', 'Ana Silva').within(() => {
      cy.get('td').first().click({ force: true });
    });

    cy.url().should('include', '/clientes');
    cy.go('back');
    cy.url().should('include', '/clientes');
    
    mockListaClientes(clientesMock);
    cy.wait('@buscarClientes');

    cy.contains('.p-datatable tbody tr', 'Ana Silva').should('be.visible');
    cy.contains('.p-datatable tbody tr', 'Ana Silva').within(() => {
      cy.get('button').first().click({ force: true });
    });

    cy.url().should('match', /\/clientes\/1\/editar$/);
    cy.go('back');
    cy.url().should('include', '/clientes');
  });
});


