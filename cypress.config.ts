import { defineConfig } from 'cypress';

// Usa variável de ambiente se disponível (Docker), senão usa localhost
const baseUrl = process.env.CYPRESS_baseUrl || 'http://localhost:4200';

export default defineConfig({
  e2e: {
    baseUrl,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    // Configurações para melhorar a estabilidade
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    // Configurações do navegador
    viewportWidth: 1920,
    viewportHeight: 1080
  }
});


