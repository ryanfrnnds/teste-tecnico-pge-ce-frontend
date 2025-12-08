/// <reference types="cypress" />

const API_LOGIN = '/api/auth/login';

function mockLoginFluxo() {
  cy.intercept('POST', API_LOGIN, {
    statusCode: 200,
    body: {
      token: 'fake-token',
      user: {
        id: 1,
        username: 'admin',
        name: 'Administrador',
      },
    },
  }).as('login');
}

function mockLocalizacaoFluxo() {
  cy.intercept('GET', '/api/paises', {
    statusCode: 200,
    body: [
      { id: 1, codigo: 'BR', nome: 'Brasil' },
      { id: 2, codigo: 'US', nome: 'Estados Unidos' },
    ],
  }).as('paises');

  cy.intercept('GET', '/api/estados*', {
    statusCode: 200,
    body: [
      { id: 1, sigla: 'CE', nome: 'Ceará', paisId: 1 },
      { id: 2, sigla: 'SP', nome: 'São Paulo', paisId: 1 },
    ],
  }).as('estados');

  cy.intercept('GET', '/api/municipios*', {
    statusCode: 200,
    body: [
      { id: 1, nome: 'Fortaleza', estadoId: 1 },
      { id: 2, nome: 'Sobral', estadoId: 1 },
      { id: 3, nome: 'São Paulo', estadoId: 2 },
    ],
  }).as('municipios');
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

describe('Fluxo de Cadastro de Cliente', () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
    mockLoginFluxo();
    mockLocalizacaoFluxo();
    
    cy.intercept('GET', '/api/clientes*', {
      statusCode: 200,
      body: [],
      headers: { 'x-total-count': '0' }
    }).as('buscarClientes');
    
    cy.intercept('GET', '/api/logs*', {
      statusCode: 200,
      body: []
    }).as('logs');
    
    fazerLogin();
  });

  it('Deve validar campos obrigatórios', () => {
    cy.contains('button', 'Novo Cliente').click();
    cy.url().should('include', '/clientes/novo');

    cy.get('input#nome', { timeout: 10000 }).should('be.visible');
    cy.wait(['@paises', '@estados'], { timeout: 10000 });
    
    cy.get('p-button#btnSalvar button').should('not.be.disabled');
    cy.get('input#nome').should('have.value', '');
    cy.get('input#email').should('have.value', '');

    cy.intercept('POST', '/api/clientes', {
      statusCode: 400,
      body: { error: 'Validation failed' },
    }).as('preventSubmit');

    cy.get('p-button#btnSalvar button').click({ force: true });
    cy.wait(2000);

    cy.url().then((url) => {
      if (url.includes('/clientes/novo')) {
        cy.get('body').then(($body) => {
          const formErrors = $body.find(
            'form .alert.p-error, form .p-error, form .p-invalid, form small.p-error, .p-fluid .alert.p-error, .p-fluid .p-error, .p-field-error, .p-message-error',
          ).length;

          if (formErrors > 0) {
            cy.contains('Nome é obrigatório', { timeout: 5000 }).should('exist');
            cy.contains('Obrigatório', { timeout: 5000 }).should('exist');
          } else {
            cy.get('input#nome', { timeout: 5000 }).should('have.class', 'ng-invalid');
            cy.get('input#email', { timeout: 5000 }).should('have.class', 'ng-invalid');
          }
        });
      }
    });
  });

  it('Deve validar interações entre campos de localização', () => {
    cy.contains('button', 'Novo Cliente').click();
    cy.url().should('include', '/clientes/novo');
    cy.wait(['@paises', '@estados'], { timeout: 10000 });

    cy.get('#pais', { timeout: 10000 }).should('be.visible');
    cy.get('#pais').click({ force: true });
    cy.contains('li', 'Brasil').click({ force: true });

    cy.wait(500);

    cy.get('#estado', { timeout: 5000 }).should('be.visible');
    cy.get('#estado').click({ force: true });
    cy.contains('li', 'Ceará').click({ force: true });

    cy.wait('@municipios');
    cy.wait(500);

    cy.get('#cidade', { timeout: 5000 }).should('be.visible');
    cy.get('#cidade').click({ force: true });
    cy.contains('li', 'Fortaleza').should('exist');
    cy.contains('li', 'Sobral').should('exist');
  });

  it('Deve validar formatação de CPF', () => {
    cy.contains('button', 'Novo Cliente').click();
    cy.url().should('include', '/clientes/novo');
    cy.wait(['@paises', '@estados'], { timeout: 10000 });

    cy.get('#cpf input', { timeout: 10000 }).should('be.visible');
    cy.get('#cpf input').type('12345678901', { force: true });
    cy.get('#cpf input').should('have.value', '123.456.789-01');
  });

  it('Deve validar formatação de Email', () => {
    cy.contains('button', 'Novo Cliente').click();
    cy.url().should('include', '/clientes/novo');
    cy.wait(['@paises', '@estados'], { timeout: 10000 });

    cy.get('input#email', { timeout: 10000 }).should('be.visible');
    cy.get('input#email').type('teste@exemplo.com', { force: true });
    cy.get('input#email').should('have.value', 'teste@exemplo.com');
    
    cy.get('input#email').clear({ force: true });
    cy.get('input#email').type('email-invalido', { force: true });
    cy.get('input#email').blur({ force: true });
    cy.wait(500);
    
    cy.get('input#email').should('have.class', 'ng-invalid');
  });

  it('Deve validar formatação de Telefone', () => {
    cy.contains('button', 'Novo Cliente').click();
    cy.url().should('include', '/clientes/novo');
    cy.wait(['@paises', '@estados'], { timeout: 10000 });

    cy.get('#telefone input', { timeout: 10000 }).should('be.visible');
    cy.get('#telefone input').type('85999999999', { force: true });
    cy.get('#telefone input').should('have.value', '(85) 9 9999-9999');
  });

  it('Deve salvar cliente completo com sucesso', () => {
    cy.contains('button', 'Novo Cliente').click();
    cy.url().should('include', '/clientes/novo');
    cy.wait(['@paises', '@estados'], { timeout: 10000 });

    const novoCliente = {
      id: 'cli-test-123',
      nome: 'Cliente Teste',
      email: 'teste@exemplo.com',
      cpf: '12345678901',
      telefone: '85999999999',
      ativo: true
    };

    cy.intercept('POST', '**/api/clientes', {
      statusCode: 201,
      body: novoCliente
    }).as('criarCliente');

    cy.intercept('POST', '**/api/logs', {
      statusCode: 201,
      body: { id: 1, acao: 'CRIACAO', mensagem: 'Cliente criado' }
    }).as('logCriacao');

    cy.get('input#nome').type('Cliente Teste', { force: true });
    cy.get('input#email').type('teste@exemplo.com', { force: true });
    cy.get('#cpf input').type('12345678901', { force: true });
    
    cy.get('#tipoContato', { timeout: 5000 }).should('be.visible');
    cy.get('#tipoContato').click({ force: true });
    cy.contains('li', 'Residencial').click({ force: true });
    cy.wait(500);
    
    cy.get('#telefone input').type('85999999999', { force: true });
    
    cy.get('p-calendar#dataNascimento input', { timeout: 10000 }).should('be.visible');
    cy.get('p-calendar#dataNascimento input').clear({ force: true }).type('01/01/1990', { force: true });
    cy.wait(500);

    cy.get('#pais', { timeout: 10000 }).should('be.visible');
    cy.get('#pais').click({ force: true });
    cy.contains('li', 'Brasil').click({ force: true });
    cy.wait(1000);

    cy.get('#estado', { timeout: 5000 }).should('be.visible');
    cy.get('#estado').click({ force: true });
    cy.contains('li', 'Ceará').click({ force: true });
    cy.wait(1000);

    cy.get('#cidade', { timeout: 5000 }).should('be.visible');
    cy.get('#cidade').click({ force: true });
    cy.contains('li', 'Fortaleza').click({ force: true });
    cy.wait(500);

    cy.get('#cep input', { timeout: 5000 }).should('be.visible');
    cy.get('#cep input').type('60000000', { force: true });
    cy.get('input#logradouro').type('Rua Teste', { force: true });
    cy.get('input#numero').type('123', { force: true });
    cy.get('input#bairro').type('Centro', { force: true });
    cy.wait(1500);

    cy.get('input#nome').should('not.have.class', 'ng-invalid');
    cy.get('input#email').should('not.have.class', 'ng-invalid');
    cy.get('#cpf').should('not.have.class', 'ng-invalid');
    cy.get('p-button#btnSalvar button').should('be.visible').should('not.be.disabled');
    cy.get('p-button#btnSalvar button').click({ force: true });
    cy.wait('@criarCliente', { timeout: 20000 });
    cy.wait('@logCriacao', { timeout: 10000 });

    cy.url({ timeout: 10000 }).should('include', '/clientes');
    cy.get('.p-toast-message-success', { timeout: 5000 }).should('be.visible');
  });

  it('Deve editar cliente completo com sucesso', () => {
    const clienteExistente = {
      id: 'cli-test-123',
      nome: 'Cliente Original',
      email: 'original@exemplo.com',
      cpf: '12345678901',
      telefone: '85999999999',
      tipoContato: 'Residencial',
      dataNascimento: new Date('1990-01-01').toISOString(),
      pais: 'Brasil',
      endereco: {
        cep: '60000000',
        logradouro: 'Rua Original',
        numero: '456',
        complemento: '',
        bairro: 'Aldeota',
        cidade: 'Fortaleza',
        estado: 'CE'
      },
      ativo: true
    };

    cy.intercept('GET', '**/api/clientes/cli-test-123', {
      statusCode: 200,
      body: clienteExistente
    }).as('buscarCliente');

    cy.intercept('PUT', '**/api/clientes/cli-test-123', (req) => {
      req.reply({
        statusCode: 200,
        body: { ...clienteExistente, nome: 'Cliente Editado' }
      });
    }).as('atualizarCliente');

    cy.intercept('POST', '**/api/logs', {
      statusCode: 201,
      body: { id: 1, acao: 'ATUALIZACAO', mensagem: 'Cliente atualizado' }
    }).as('logAtualizacao');

    cy.visit('/clientes/cli-test-123/editar');
    cy.wait(['@buscarCliente', '@paises', '@estados'], { timeout: 10000 });
    cy.wait(3000);

    cy.get('input#nome', { timeout: 10000 }).should('be.visible');
    cy.get('input#nome').should('have.value', 'Cliente Original');
    cy.get('input#email', { timeout: 5000 }).should('be.visible');
    cy.wait(1000);

    cy.get('input#nome').clear({ force: true }).type('Cliente Editado', { force: true });
    cy.wait(1500);

    cy.get('input#nome').should('have.value', 'Cliente Editado');
    cy.get('input#nome').should('not.have.class', 'ng-invalid');
    cy.get('input#email').should('not.have.class', 'ng-invalid');
    cy.get('.alert.p-error').should('not.exist');
    
    cy.get('p-button#btnSalvar button').should('be.visible');
    cy.get('p-button#btnSalvar button').should('not.be.disabled');
    cy.get('p-button#btnSalvar button').click({ force: true });
    
    cy.wait('@atualizarCliente', { timeout: 20000 });
    cy.wait('@logAtualizacao', { timeout: 10000 });

    cy.url({ timeout: 10000 }).should('include', '/clientes');
    cy.get('.p-toast-message-success', { timeout: 5000 }).should('be.visible');
  });

  it('Deve marcar todos os campos como tocados ao clicar em salvar sem preencher', () => {
    cy.contains('button', 'Novo Cliente').click();
    cy.url().should('include', '/clientes/novo');
    cy.wait(['@paises', '@estados'], { timeout: 10000 });
    cy.wait(500);

    cy.get('p-button#btnSalvar button').click({ force: true });
    cy.wait(2000);

    cy.get('input#nome').should('have.class', 'ng-invalid');
    cy.get('input#email').should('have.class', 'ng-invalid');
    
    cy.contains('.alert.p-error', 'Nome é obrigatório').should('exist');
    cy.contains('.alert.p-error', 'Obrigatório').should('exist');
    cy.get('.alert.p-error').should('have.length.at.least', 2);
  });

});

