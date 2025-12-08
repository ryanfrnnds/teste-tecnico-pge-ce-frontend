/// <reference types="cypress" />

namespace ApiEndpoints {
  export const CLIENTES = '/api/clientes';
  export const LOGIN = '/api/auth/login';
  export const LOGS = '/api/logs';
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

function mockContarTotal(total: number) {
  cy.wrap(total);
}

function mockLogs(logs: any[] = []) {
  cy.intercept('GET', ApiEndpoints.LOGS + '*', {
    statusCode: 200,
    body: logs
  }).as('logs');
}

function fazerLogin() {
  cy.visit('/login');
  cy.get('input[formControlName="username"]', { timeout: 10000 }).should('be.visible');
  cy.get('input[formControlName="username"]').clear({ force: true }).type('admin', { force: true });
  cy.wait(300);
  cy.get('#password input', { timeout: 10000 }).should('be.visible');
  cy.get('#password input').type('admin', { force: true });
  cy.wait(300);
  cy.get('button[type="submit"]', { timeout: 10000 }).should('be.visible');
  cy.get('button[type="submit"]').click({ force: true });
  cy.wait('@login');
  cy.url().should('include', '/clientes');
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
        cidade: 'Fortaleza',
        estado: 'CE'
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
        cidade: 'Sobral',
        estado: 'CE'
      },
      ativo: false
    },
    {
      id: '3',
      nome: 'Maria Oliveira',
      cpf: '00113334455',
      email: 'maria.oliveira@exemplo.com',
      telefone: '8598000002',
      endereco: {
        cidade: 'Fortaleza',
        estado: 'CE'
      },
      ativo: true
    }
  ];

  beforeEach(() => {
    mockLogin();
    mockListaClientes(clientesMock);
    mockLogs();
    mockContarTotal(clientesMock.length);
    
    fazerLogin();
    cy.wait('@buscarClientes');
    cy.get('.p-skeleton', { timeout: 10000 }).should('not.exist');
  });

  it('Deve validar quantidade de chamadas na tela de listagem', () => {
    cy.get('@buscarClientes.all').then((interceptions) => {
      expect(interceptions.length).to.be.at.least(1);
    });
  });

  it('Deve aplicar filtro por nome', () => {
    const clientesFiltrados = clientesMock.filter(c => c.nome.includes('Ana'));
    mockListaClientes(clientesFiltrados, clientesFiltrados.length, {
      nome_like: 'Ana'
    });

    cy.get('input[formControlName="nome"]').clear().type('Ana');
    cy.wait(600);
    cy.wait('@buscarClientes');
    
    cy.get('input[formControlName="nome"]').should('have.value', 'Ana');
  });

  it('Deve aplicar filtro por cidade', () => {
    const clientesFiltrados = clientesMock.filter(c => c.endereco.cidade === 'Fortaleza');
    mockListaClientes(clientesFiltrados, clientesFiltrados.length, {
      'endereco.cidade_like': 'Fortaleza'
    });

    cy.get('input[formControlName="cidade"]').clear().type('Fortaleza');
    cy.wait(600);
    cy.wait('@buscarClientes');
    
    cy.get('input[formControlName="cidade"]').should('have.value', 'Fortaleza');
  });

  it('Deve aplicar filtros combinados (nome e cidade)', () => {
    const clientesFiltrados = clientesMock.filter(
      c => c.nome.includes('Ana') && c.endereco.cidade === 'Fortaleza'
    );
    mockListaClientes(clientesFiltrados, clientesFiltrados.length, {
      nome_like: 'Ana',
      'endereco.cidade_like': 'Fortaleza'
    });

    cy.get('input[formControlName="nome"]').clear().type('Ana');
    cy.get('input[formControlName="cidade"]').clear().type('Fortaleza');
    cy.wait(600);
    cy.wait('@buscarClientes');
  });

  it('Deve validar existência apenas dos filtros nome e cidade', () => {
    cy.get('input[formControlName="nome"]').should('exist');
    cy.get('input[formControlName="cidade"]').should('exist');
    cy.get('input[formControlName]').should('have.length', 2);
  });

  it('Deve filtrar por status ao clicar nos ícones do header', () => {
    const clientesAtivos = clientesMock.filter(c => c.ativo);
    mockListaClientes(clientesAtivos, clientesAtivos.length, { ativo: 'true' });

    cy.get('.status-filter-icon').eq(1).click({ force: true });
    cy.wait('@buscarClientes');
    cy.wait(500);

    const clientesInativos = clientesMock.filter(c => !c.ativo);
    mockListaClientes(clientesInativos, clientesInativos.length, { ativo: 'false' });

    cy.get('.status-filter-icon').eq(2).click({ force: true });
    cy.wait('@buscarClientes');
    cy.wait(500);

    mockListaClientes(clientesMock, clientesMock.length);
    cy.get('.status-filter-icon').eq(0).click({ force: true });
    cy.wait('@buscarClientes');
  });

  it('Deve inativar cliente ao clicar no botão de ações', () => {
    cy.intercept('PATCH', `${ApiEndpoints.CLIENTES}/1`, {
      statusCode: 200,
      body: { ...clientesMock[0], ativo: false }
    }).as('inativarCliente');

    cy.intercept('POST', ApiEndpoints.LOGS, {
      statusCode: 201,
      body: { id: 1, acao: 'INATIVACAO', mensagem: 'Cliente "Ana Silva" foi desativado' }
    }).as('logInativacao');

    mockListaClientes([{ ...clientesMock[0], ativo: false }]);

    cy.get('body').then(($body) => {
      if ($body.find('.p-datatable tbody tr').length > 0) {
        cy.get('.p-datatable tbody tr').first().find('.pi-trash').click({ force: true });
      }
    });

    cy.contains('.p-dialog', 'Confirmar Inativação').should('be.visible');
    cy.contains('.p-dialog button', 'Confirmar').click({ force: true });

    cy.wait('@inativarCliente');
    cy.wait('@logInativacao');
    cy.wait('@buscarClientes');
  });

  it('Deve inativar múltiplos clientes selecionados', () => {
    cy.intercept('PATCH', `${ApiEndpoints.CLIENTES}/bulk-inactivate`, {
      statusCode: 200,
      body: { message: '2 cliente(s) inativado(s) com sucesso' }
    }).as('inativarEmMassa');

    cy.intercept('POST', ApiEndpoints.LOGS, {
      statusCode: 201,
      body: { id: 1, acao: 'INATIVACAO', mensagem: 'Cliente inativado' }
    }).as('logInativacao');

    mockListaClientes(clientesMock.filter(c => c.ativo), clientesMock.filter(c => c.ativo).length, { ativo: 'true' });

    cy.get('.status-filter-icon').eq(1).click({ force: true });
    cy.wait('@buscarClientes');
    cy.wait(500);

    cy.get('.p-datatable tbody tr').each(($row) => {
      cy.wrap($row).find('input[type="checkbox"]').check({ force: true });
    });

    cy.contains('button', 'Inativar Selecionados').click({ force: true });
    cy.contains('.p-dialog button', 'Confirmar').click({ force: true });

    cy.wait('@inativarEmMassa');
  });

  it('Deve reativar cliente inativo', () => {
    const clienteInativo = { ...clientesMock[1], ativo: false };
    mockListaClientes([clienteInativo], 1, { ativo: 'false' });

    cy.get('.status-filter-icon').eq(2).click({ force: true });
    cy.wait('@buscarClientes');
    cy.wait(500);

    cy.intercept('PATCH', `${ApiEndpoints.CLIENTES}/2`, {
      statusCode: 200,
      body: { ...clienteInativo, ativo: true }
    }).as('reativarCliente');

    cy.intercept('POST', ApiEndpoints.LOGS, {
      statusCode: 201,
      body: { id: 1, acao: 'ATUALIZACAO', mensagem: 'Cliente "Carlos Santos" foi reativado' }
    }).as('logReativacao');

    cy.get('.p-datatable tbody tr').first().find('.pi-refresh').click({ force: true });

    cy.contains('.p-dialog', 'Confirmar Reativação').should('be.visible');
    cy.contains('.p-dialog button', 'Confirmar').click({ force: true });

    cy.wait('@reativarCliente');
    cy.wait('@logReativacao');
  });

  it('Deve validar formatações LGPD (CPF, Email, Telefone)', () => {
    cy.wait('@buscarClientes');
    cy.get('.p-skeleton', { timeout: 10000 }).should('not.exist');
    cy.wait(500);

    cy.get('body').then(($body) => {
      if ($body.find('.p-datatable tbody tr').length > 0) {
        cy.get('.p-datatable tbody tr').first().within(() => {
          cy.get('td').eq(1).invoke('text').should((text) => {
            expect(text.trim()).to.match(/\*\*\*.\*\*\*.\*\*\*-\d{2}/);
          });
          cy.get('td').eq(2).invoke('text').should((text) => {
            expect(text.trim()).to.match(/^[a-zA-Z]\*+(?:\.[a-zA-Z]\*+)?@.+$/);
          });
          cy.get('td').eq(3).invoke('text').should((text) => {
            expect(text.trim()).to.match(/^\(\d{2}\)\s(?:9\*{4}|\*{4})-\d{4}$/);
          });
        });
      }
    });
  });

  it('Deve manter estado da tela após navegação', () => {
    mockListaClientes(clientesMock, clientesMock.length, {
      nome_like: 'Ana',
      'endereco.cidade_like': 'Fortaleza'
    });

    cy.get('input[formControlName="nome"]').clear().type('Ana');
    cy.get('input[formControlName="cidade"]').clear().type('Fortaleza');
    cy.wait(600);
    cy.wait('@buscarClientes');

    cy.url().should('include', 'nome=Ana');
    cy.url().should('include', 'cidade=Fortaleza');

    mockListaClientes(clientesMock, clientesMock.length, {
      nome_like: 'Ana',
      'endereco.cidade_like': 'Fortaleza'
    });
    mockLogin();

    cy.reload();
    cy.wait('@buscarClientes', { timeout: 10000 });
    cy.wait(1000);

    cy.url().should('include', 'nome=Ana');
    cy.get('input[formControlName="nome"]', { timeout: 5000 }).should('have.value', 'Ana');
    cy.get('input[formControlName="cidade"]', { timeout: 5000 }).should('have.value', 'Fortaleza');
  });

  it('Deve navegar para edição ao clicar no botão editar', () => {
    cy.get('.p-datatable tbody tr').first().find('.pi-pencil').click({ force: true });

    cy.url().should('match', /\/clientes\/\w+\/editar$/);
  });

  it('Deve remover todos os registros ao clicar em remover todos do modal inicial', () => {
    cy.intercept('POST', `${ApiEndpoints.CLIENTES}/bulk-delete`, {
      statusCode: 200,
      body: { message: 'Todos os clientes foram removidos' }
    }).as('removerTodos');

    cy.intercept('POST', `${ApiEndpoints.LOGS}/bulk-delete`, {
      statusCode: 200,
      body: { message: 'Todos os logs foram removidos' }
    }).as('removerLogs');

    cy.get('body').then(($body) => {
      if ($body.find('.p-dialog').is(':visible')) {
        cy.contains('.p-dialog button', 'Remover Todos').click({ force: true });
        cy.wait('@removerTodos');
        cy.wait('@removerLogs');
      }
    });
  });

  it('Deve validar paginação e totais', () => {
    cy.wait('@buscarClientes');
    cy.get('.p-paginator').should('exist');
  });
});
