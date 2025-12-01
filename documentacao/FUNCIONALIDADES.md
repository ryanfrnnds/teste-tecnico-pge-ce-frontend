# 📋 Funcionalidades Implementadas

> Versão resumida das principais funcionalidades entregues, alinhadas ao PDF do teste.

## Lista de Clientes (Página Principal)

Conforme especificado no documento de referência ([PDF oficial](../referencias/Teste%20Pr%C3%A1tico%20-%20Desenvolvedor%20-%20Front-End%20-%20Procuradoria%20Geral%20do%20Estado%20do%20Cear%C3%A1.pdf)), implementamos uma **tela completa de listagem de clientes** com:

### ✅ Funcionalidades Core
- **Lista paginada / scrollável:** tabela PrimeNG com lista otimizada em desktops (scroll interno + paginator) e cards em mobile.
- **Filtros avançados:**
  - busca por texto com campos específicos para **nome** e **cidade** (Reactive Forms);
  - filtro por **status** (Todos / Ativos / Inativos) com contadores por status;
  - preservação de estado via **query params** + `sessionStorage` (a página volta sempre no mesmo contexto).
- **Ações CRUD (parciais):**
  - ações de **inativação** (soft delete) simples e em massa;
  - ação de **reativação** em massa de clientes inativos;
  - navegação para rotas de visualização/edição (`/clientes/:id`, `/clientes/:id/editar`) já preparada (fluxos de formulário em evolução).
- **Responsividade:** layout adaptável (cards mobile + tabela desktop), com foco em mostrar as principais informações sem navegação extra.

### ✅ UX/UI Features
- **Loading states:** skeleton loading durante carregamento da lista, integrados com `LoadingService`.
- **Empty states:** mensagens informativas e CTAs contextuais quando não há dados (incluindo sugestão de inserir clientes de teste em dev).
- **Feedback visual:** toasts (`p-toast`) customizados para sucesso/erro/info/warn; tags de status coloridas (`Ativo/Inativo`).
- **Modal de confirmação reutilizável:** `ConfirmModalComponent` para confirmação antes de exclusão/reativação (simples e em massa).
- **Tooltips e acessibilidade:** dicas nas ações da tabela e tooltips para dados sensíveis (CPF, telefone, e-mail).

## Lista de Logs (Auditoria)

Implementamos uma tela de **lista de logs** para demonstrar o requisito de observabilidade:

- Filtros por **termo de busca**, **data inicial** e **data final** (Reactive Forms + PrimeNG `p-calendar`).
- Preservação de filtros via **query params** + `sessionStorage` (mesma ideia da tela de clientes).
- Layout responsivo com:
  - cards em mobile;
  - tabela scrollável em desktop com ordenação por data/ação/usuário.
- Integração com `LogService` e `LoggerService`, permitindo auditar operações relevantes (criação, atualização, exclusão, reativação).

## Autenticação (Login Demonstrativo)

Para demonstrar integração de **Auth + Logs + UX reativa**, foi criado um fluxo de login minimalista:

- **Formulário reativo** (`LoginComponent`) com validações obrigatórias e mensagens de erro amigáveis.
- Integração com `AuthService` chamando `/api/auth/login` (mockado via json-server).
- Persistência de token e usuário autenticado em `localStorage` e restauração de sessão.
- Uso de `MessageService`/`p-toast` para feedback de sucesso/erro no login.
- Integração com logs:
  - ações na tela de clientes/logs registram o `usuario` autenticado;
  - quando não há usuário, logs são atribuídos ao `"system"`.

## Privacidade & LGPD (no contexto do teste)

Mesmo sendo um teste simplificado, há preocupação com o tratamento de dados sensíveis:

- **Pipes de máscara** (`maskCpf`, `maskPhone`, `maskEmail`) aplicados na listagem de clientes:
  - exibem apenas parte do CPF/telefone/e-mail;
  - os valores completos podem ser exibidos em tooltip quando necessário.
- **Diretivas de formatação** (`appCpfFormat`, `appTelefoneFormat`, `appEmailFormat`):
  - aplicam formatação/máscara em elementos de template;
  - podem adicionar/remover tooltips controlados (`data-tooltip`) para não vazar dados além da camada de UI.
- **Storage mínimo:** apenas token + usuário autenticado ficam em `localStorage`; dados de clientes/logs permanecem no backend mock (`json-server`).

## Infraestrutura e Arquitetura (Resumo)

- **Core (`src/app/core`)**: serviços globais, modelos, decorators, interceptors, pipes, diretivas e componentes compartilhados.
- **Pages (`src/app/pages`)**: componentes de página roteáveis, separados por feature (`clientes`, `logs`, `auth`).
- **Path Aliases:** `@core/*`, `@pages/*` para imports limpos.
- **Docker Environment:** desenvolvimento, testes unitários (Karma) e testes E2E (Cypress) em containers dedicados.
- **Loading global:** `LoadingService` + `LoadingInterceptor` com empilhamento de requisições e integração com skeletons de tela.
- **API mock:** `json-server` para clientes, logs e login (`/auth/login`).

## Estratégia de Testes (Resumo)

- **Core / Services / Infra:**
  - `ClienteService`, `LoadingService`, `AuthService`, `LogService`, `LoggerService`;
  - `LoadingInterceptor`, pipes de máscara, `authGuard`, resolvers de clientes/logs.
- **Pages:**
  - `ListaClientesComponent` + `ListaClientesStore` (listagem, filtros, estado, exclusão/reativação);
  - `LoginComponent` (fluxo de autenticação);
  - `ListaLogsStore` (filtros e carregamento de logs).
- **E2E (Cypress):**
  - `cypress/e2e/clientes-lista.cy.ts` validando o fluxo completo da lista de clientes (login, filtros, query params, paginação, status, exclusão/reativação, navegação).

