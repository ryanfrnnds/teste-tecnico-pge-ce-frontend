/// <reference types="cypress" />

const API_LOGIN = '/api/auth/login';
const API_LOGS = '/api/logs';
const API_CLIENTES = '/api/clientes';

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

describe('Tela de Logs', () => {
  const logsMock = [
    {
      id: 1,
      data: new Date().toISOString(),
      acao: 'CRIACAO',
      mensagem: 'Cliente "Ana Silva" foi criado',
      usuario: 'admin'
    },
    {
      id: 2,
      data: new Date(Date.now() - 3600000).toISOString(),
      acao: 'ATUALIZACAO',
      mensagem: 'Cliente "Ana Silva" foi reativado',
      usuario: 'admin'
    },
    {
      id: 3,
      data: new Date(Date.now() - 7200000).toISOString(),
      acao: 'INATIVACAO',
      mensagem: 'Cliente "Carlos Santos" foi desativado',
      usuario: 'admin'
    },
    {
      id: 4,
      data: new Date(Date.now() - 10800000).toISOString(),
      acao: 'ATUALIZACAO',
      mensagem: 'Cliente "Maria Oliveira" teve dados atualizados',
      usuario: 'admin'
    }
  ];

  beforeEach(() => {
    mockLogin();
    
    cy.intercept('GET', API_CLIENTES + '*', {
      statusCode: 200,
      body: [],
      headers: { 'x-total-count': '0' }
    }).as('buscarClientes');
    
    fazerLogin();
  });

  it('Deve validar registros de CRIACAO', () => {
    const logsCriacao = logsMock.filter(l => l.acao === 'CRIACAO');
    
    cy.intercept('GET', API_LOGS + '*', {
      statusCode: 200,
      body: logsCriacao
    }).as('buscarLogs');

    cy.visit('/logs');
    cy.wait('@buscarLogs');

    cy.get('.p-datatable tbody tr', { timeout: 10000 }).should('have.length', logsCriacao.length);
    cy.contains('.p-datatable', 'CRIACAO').should('exist');
    cy.contains('.p-datatable', 'Cliente "Ana Silva" foi criado').should('exist');
  });

  it('Deve validar registros de ATUALIZACAO', () => {
    const logsAtualizacao = logsMock.filter(l => l.acao === 'ATUALIZACAO');
    
    cy.intercept('GET', API_LOGS + '*', {
      statusCode: 200,
      body: logsAtualizacao
    }).as('buscarLogs');

    cy.visit('/logs');
    cy.wait('@buscarLogs');

    cy.get('.p-datatable tbody tr', { timeout: 10000 }).should('have.length', logsAtualizacao.length);
    cy.contains('.p-datatable', 'ATUALIZACAO').should('exist');
    cy.contains('.p-datatable', 'foi reativado').should('exist');
    cy.contains('.p-datatable', 'teve dados atualizados').should('exist');
  });

  it('Deve validar registros de INATIVACAO', () => {
    const logsInativacao = logsMock.filter(l => l.acao === 'INATIVACAO');
    
    cy.intercept('GET', API_LOGS + '*', {
      statusCode: 200,
      body: logsInativacao
    }).as('buscarLogs');

    cy.visit('/logs');
    cy.wait('@buscarLogs');

    cy.get('.p-datatable tbody tr', { timeout: 10000 }).should('have.length', logsInativacao.length);
    cy.contains('.p-datatable', 'INATIVACAO').should('exist');
    cy.contains('.p-datatable', 'foi desativado').should('exist');
  });

  it('Deve validar que não existe ação EXCLUSAO nos logs', () => {
    cy.intercept('GET', API_LOGS + '*', {
      statusCode: 200,
      body: logsMock
    }).as('buscarLogs');

    cy.visit('/logs');
    cy.wait('@buscarLogs');

    cy.get('.p-datatable tbody tr', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.contains('.p-datatable', 'EXCLUSAO').should('not.exist');
  });

  it('Deve validar filtro por ações', () => {
    cy.intercept('GET', API_LOGS + '*', {
      statusCode: 200,
      body: logsMock
    }).as('buscarLogs');

    cy.visit('/logs');
    cy.wait('@buscarLogs');
    cy.wait(500);

    cy.get('p-multiSelect[inputId="acoes"]', { timeout: 10000 }).should('be.visible');
    cy.get('p-multiSelect[inputId="acoes"]').click({ force: true });
    cy.wait(500);

    cy.contains('li', 'Criação').should('exist');
    cy.contains('li', 'Atualização').should('exist');
    cy.contains('li', 'Inativação').should('exist');
    cy.contains('li', 'Exclusão').should('not.exist');
  });

  it('Deve validar filtro por termo de busca', () => {
    cy.intercept('GET', API_LOGS + '*', {
      statusCode: 200,
      body: logsMock
    }).as('buscarLogs');

    cy.visit('/logs');
    cy.wait('@buscarLogs');
    cy.wait(500);

    cy.get('input[formControlName="termoBusca"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[formControlName="termoBusca"]').type('Ana Silva', { force: true });
    cy.wait(600);

    cy.contains('.p-datatable', 'Ana Silva').should('exist');
  });

  it('Deve validar filtro por data', () => {
    cy.intercept('GET', API_LOGS + '*', {
      statusCode: 200,
      body: logsMock
    }).as('buscarLogs');

    cy.visit('/logs');
    cy.wait('@buscarLogs');
    cy.wait(500);

    const hoje = new Date();
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);

    cy.get('p-calendar[inputId="dataInicio"]', { timeout: 10000 }).should('be.visible');
    cy.get('p-calendar[inputId="dataInicio"]').click({ force: true });
    cy.wait(500);
  });
});

