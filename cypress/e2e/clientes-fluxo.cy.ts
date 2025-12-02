describe('Fluxo Completo de Clientes', () => {
  beforeEach(() => {
    // Limpa o banco de dados antes de cada teste para garantir isolamento
    // Supondo que exista um comando ou endpoint para resetar o banco, ou fazendo via UI se implementado
    // Como implementamos o botão de limpar dados em DEV, poderíamos usar ele, mas aqui vamos assumir um estado limpo ou isolado
    cy.viewport(1920, 1080);
  });

  it('Deve criar, editar e excluir um cliente com sucesso', () => {
    // 1. Login
    cy.visit('/auth/login');
    cy.get('input[formControlName="email"]').type('admin@pge.ce.gov.br');
    cy.get('input[formControlName="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/clientes');

    // 2. Navegar para Novo Cliente
    cy.get('button[label="Novo Cliente"]').click();
    cy.url().should('include', '/clientes/novo');

    // 3. Preencher Formulário
    const timestamp = new Date().getTime();
    const nomeCliente = `Cliente Teste ${timestamp}`;
    
    cy.get('input[formControlName="nome"]').type(nomeCliente);
    cy.get('input[formControlName="cpf"]').type('12345678909');
    cy.get('input[formControlName="email"]').type(`cliente${timestamp}@teste.com`);
    cy.get('input[formControlName="telefone"]').type('85999999999');
    
    // Data de Nascimento
    cy.get('p-calendar[formControlName="dataNascimento"] input').type('01/01/1990');
    
    // Endereço
    cy.get('input[formControlName="cep"]').type('60000000');
    cy.get('input[formControlName="logradouro"]').type('Rua Teste Automatizado');
    cy.get('input[formControlName="numero"]').type('123');
    cy.get('input[formControlName="bairro"]').type('Centro');
    
    // Selects (PrimeNG Dropdown) - fluxo simplificado se não houver dependência de API externa real
    // Assumindo que os dados de localização mockados ou reais estão carregando
    // cy.get('p-select[formControlName="pais"]').click();
    // cy.get('p-dropdownitem').contains('Brasil').click();

    // 4. Salvar
    cy.get('button[type="submit"]').click();
    
    // 5. Verificar Redirecionamento e Toast
    cy.get('.p-toast-message-success').should('be.visible');
    cy.url().should('match', /\/clientes$/);
    
    // 6. Verificar se cliente está na lista
    cy.contains(nomeCliente).should('be.visible');

    // 7. Editar Cliente
    cy.contains('tr', nomeCliente).find('button[icon="pi pi-pencil"]').click();
    cy.url().should('include', '/editar');
    
    const nomeEditado = `${nomeCliente} Editado`;
    cy.get('input[formControlName="nome"]').clear().type(nomeEditado);
    cy.get('button[type="submit"]').click();
    
    cy.get('.p-toast-message-success').should('be.visible');
    cy.contains(nomeEditado).should('be.visible');

    // 8. Excluir Cliente
    cy.contains('tr', nomeEditado).find('button[icon="pi pi-trash"]').click();
    // Confirmar no modal (assumindo p-confirmDialog ou similar)
    cy.get('p-confirmdialog button').contains('Sim').click();
    
    cy.get('.p-toast-message-success').should('be.visible');
    cy.contains(nomeEditado).should('not.exist');
  });

  it('Deve validar campos obrigatórios no formulário', () => {
    cy.visit('/auth/login');
    cy.get('input[formControlName="email"]').type('admin@pge.ce.gov.br');
    cy.get('input[formControlName="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    cy.get('button[label="Novo Cliente"]').click();
    
    // Tentar salvar sem preencher nada
    cy.get('button[type="submit"]').click();
    
    // Verificar mensagens de erro
    cy.get('.alert.p-error').should('have.length.gt', 0);
    cy.contains('Nome é obrigatório').should('be.visible');
    cy.contains('E-mail é obrigatório').should('be.visible');
  });
});

