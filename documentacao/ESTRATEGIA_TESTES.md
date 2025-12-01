## 🧪 Estratégia de Testes

### 1. Testes Implementados (Jasmine + Karma)

| Camada             | Arquivo / Área principal                                          | O que é testado?                                                                                          |
|--------------------|-------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| Core / Services    | `core/services/cliente.service.spec.ts`                          | CRUD completo de clientes, filtros, paginação, limpeza de máscaras e integração com headers/total-count. |
| Core / Services    | `core/services/loading.service.spec.ts`                          | Contador de requisições ativas, transições de estado `carregando`, cenários complexos de incremento/decr. |
| Core / Services    | `core/services/auth.service.spec.ts`                             | Login, persistência de token/usuário em `localStorage`, restauração de sessão e logout.                  |
| Core / Services    | `core/services/log.service.spec.ts`                              | Registro de logs com data, usuário autenticado e integração com `/api/logs`.                             |
| Core / Services    | `core/services/logger.service.spec.ts`                           | Envio de logs para `/api/logs` e tratamento de erro silencioso (apenas `console.error`).                 |
| Core / Interceptor | `core/interceptors/loading.interceptor.spec.ts`                  | Empilhamento de requisições `/api`, integração com `LoadingService` e exclusão de assets estáticos.      |
| Core / Pipes       | `core/pipes/mask-*.pipe.spec.ts`                                 | Máscaras de CPF, telefone e e-mail (tamanhos variados, entradas inválidas, tipos não string).           |
| Core / Guard       | `core/guards/auth.guard.spec.ts`                                 | Permissão/bloqueio de acesso com base em `AuthService.isAuthenticated` + redirecionamento para `/login`. |
| Core / Resolvers   | `core/resolvers/clientes.resolver.spec.ts`, `logs.resolver.spec.ts` | Resolução prévia de listas de clientes/logs via `ClienteService` e `LogService`.                         |
| Pages / Clientes   | `pages/clientes/lista-clientes/lista-clientes.component.spec.ts` | Delegação para a store, limpeza de campos, integração com filtros/página e ações de toolbar.             |
| Pages / Clientes   | `pages/clientes/lista-clientes/lista-clientes.store.spec.ts`     | Controle de estado via signals (página, limite, filtros, status), query params, contagens e filtros.     |
| Pages / Auth       | `pages/auth/login/login.component.spec.ts`                       | Fluxo de login (sucesso/erro), mensagens de toast, redirecionamento e bypass quando já autenticado.      |
| Pages / Logs       | `pages/logs/lista-logs/lista-logs.store.spec.ts`                 | Inicialização a partir de resolver, filtros por termo/data e fallback de carregamento via serviço.       |

### 2. Ambiente de Execução dos Testes Unitários

- Testes rodam em container Docker usando `ChromeHeadlessNoSandbox`.
- Uso de `karma-spec-reporter` para saída detalhada no console (melhor para CI/terminal).
- Ambiente de testes é isolado do desenvolvimento (`docker-compose.test.yml` + `db.test.json`).
- Scripts de atalho:
  - **Modo watch (10 minutos, com UI do Karma):** `scripts/powershell/test.ps1` / `scripts/bash/test.sh`.
  - **Execução única em Docker:** `scripts/powershell/test-unit.ps1` / `scripts/bash/test-unit.sh`.

### 3. Testes E2E (Cypress)

- Configuração em `cypress.config.ts` com `baseUrl` padrão `http://localhost:4200`.
- Execução em Docker via `docker-compose.e2e.yml` (`frontend-e2e`, `json-server-test-e2e`, `cypress-e2e`).
- Scripts de atalho: `scripts/powershell/test-e2e.ps1` / `scripts/bash/test-e2e.sh`.
- Especificações implementadas:

| Spec E2E                                 | Fluxos cobertos                                                                                                       |
|------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `cypress/e2e/clientes-lista.cy.ts`       | Login, carregamento da lista, filtros (nome/cidade), query params, paginação, filtros de status, exclusão, reativação e navegação entre rotas. |

### 4. Próximos Testes (Planejados)

- Formulário reativo de **cadastro/edição de cliente** (validações, máscaras, mensagens de erro, regras condicionais do PDF).
- Testes de componentes que ainda não existem ou estão em evolução (formulário de cliente, detalhes de cliente).
- Testes E2E adicionais com Cypress cobrindo o fluxo completo envolvendo formulário de cliente (cadastro → listagem → edição → exclusão).

