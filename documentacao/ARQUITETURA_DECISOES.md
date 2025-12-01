## 🏛️ Arquitetura & Decisões Técnicas

Este documento detalha as principais decisões arquiteturais adotadas no projeto, em alinhamento com o enunciado do teste da PGE-CE e com as práticas que queremos demonstrar.

### 1. Path Aliases (@)

Configuramos o `tsconfig.json` para utilizar atalhos de importação (`@core/*`, `@pages/*`, etc.).

- **Motivo**: eliminar imports relativos longos (`../../../models`) e facilitar refatorações, tornando o código mais legível e sustentável.

### 2. Estrutura de Pastas (Core & Pages)

Adotamos uma estrutura que separa claramente responsabilidades globais de responsabilidades de apresentação:

- **`src/app/core/`**: contém singletons, serviços globais, modelos de domínio compartilhados, interceptores, decorators, diretivas, pipes e componentes globais (ex.: modal de confirmação).
- **`src/app/pages/`**: contém os componentes de página (roteáveis). Cada subpasta representa uma feature/tela do sistema (`clientes`, `logs`, `auth`, etc.).

> **Regra geral:** se é lógica de negócio / integração com API, vai em `core`. Se é UI/fluxo de tela, vai em `pages`.

### 3. Loading Global Inteligente + Loading de Componente

Implementamos um sistema de loading que atua em dois níveis:

- **Global (app inteiro):**
  - `LoadingService`: serviço singleton que controla o número de requisições ativas e expõe um `carregando$` global.
  - `LoadingInterceptor`: intercepta chamadas HTTP para `/api`, empilhando requisições (`++`) na ida e desempilhando (`--`) na resposta/erro. O loading global só é desativado quando todas terminam.
- **Por componente/tela:**
  - componentes como a lista de clientes usam skeletons (`p-skeleton`) e estados locais reativos (stores) para controlar loading de forma mais específica, sem depender apenas do spinner global.

**Motivo:** separar responsabilidades: o interceptor cuida da infraestrutura de loading, enquanto cada página decide como traduzir isso em UX (skeleton, spinner local, desabilitar botões, etc.).

### 4. Logs via Decorator (AOP)

Para atender aos requisitos de observabilidade, adotamos um padrão inspirado em **Programação Orientada a Aspectos (AOP)**:

- Criamos um decorator `@LogOperation` em `core/decorators` que intercepta chamadas de métodos marcados e registra logs de forma centralizada (`LoggerService` / `LogService`).
- Com isso:
  - o código de CRUD permanece limpo, focado apenas na chamada HTTP;
  - o comportamento de logging pode ser ligado/desligado de forma declarativa, sem espalhar `console.log` ou chamadas de serviço por toda a base.

### 5. Docker-First

Toda a experiência do projeto foi pensada para rodar dentro de containers:

- **Dev:** `docker-compose.dev.yml` com `frontend-dev` + `json-server` e hot reload.
- **Testes unitários:** `docker-compose.test.yml` com `frontend-test` + `json-server-test` usando `db.test.json`.
- **Testes E2E:** `docker-compose.e2e.yml` com `frontend-e2e`, `json-server-test-e2e` e `cypress-e2e`.
- **Produção:** `Dockerfile` multi-stage que gera o build Angular e serve via Nginx.

**Motivo:** garantir que o avaliador tenha exatamente o mesmo ambiente de execução do desenvolvedor, eliminando problemas de "funciona na minha máquina" e aproximando do cenário de CI/CD real.

### 6. Execução de Testes em Container

Para viabilizar a execução dos testes unitários dentro do Docker:

- Criamos o *Custom Launcher* `ChromeHeadlessNoSandbox` com a flag `--no-sandbox`, necessária para rodar o Chromium como root em Alpine.
- Adicionamos o `karma-spec-reporter` para melhorar a visualização dos testes no console (útil em CI/terminal).
- Disponibilizamos scripts de atalho (`test.sh/ps1`, `test-unit.sh/ps1`) que sobem ambientes de teste isolados.

Para E2E:

- Configuramos o Cypress com `baseUrl` padrão `http://localhost:4200`, sobrescrito via `CYPRESS_baseUrl` no container.
- O serviço `cypress-e2e` roda em Docker e exercita o frontend servido por `frontend-e2e`, mantendo o ambiente coerente com o restante do projeto.

### 7. Login minimalista para demonstrar logs

O fluxo de autenticação (`/login`) não busca ser um módulo completo de segurança; ele existe para:

- demonstrar Reactive Forms (validações, mensagens de erro, UX básica de login);
- habilitar logs associados a um usuário autenticado:
  - quando há usuário logado, `LogService`/`LoggerService` registram o `username` real;
  - quando não há, o sistema registra ações com `usuario: "system"`.

Isso evidencia a integração entre **Auth**, **logs** e a **tela de auditoria (lista de logs)**.

### 8. UX: minimizar cliques e fricção

Algumas decisões de UX adotadas na lista de clientes e na lista de logs:

- filtros principais sempre visíveis (nome, cidade, status), evitando "caixa de filtros" escondida;
- cards mobile + tabela desktop, evitando que o usuário precise ir para outra tela só para ver detalhes básicos;
- ações em massa (exclusão/reativação) visíveis apenas quando fazem sentido (status ≠ `todos` e seleção > 0), reduzindo ruído;
- preservação de estado via query params + sessionStorage para que recarregar a página ou navegar para outra rota não faça o usuário "perder o contexto".

### 9. Reatividade com APIs nativas do Angular

Com Angular 16+, priorizamos as APIs reativas nativas:

- **Signals e `computed`/`effect`** nas stores de página (`ListaClientesStore`, `ListaLogsStore`) para representar estado de tela e derivar dados (paginador, contagens, listas filtradas).
- **`toSignal`** para integrar fluxos RxJS (ex.: `form.valueChanges`) com o mundo de signals, mantendo a clareza do código.
- **Reactive Forms** para filtros e login, com validações declarativas e mensagens de erro amigáveis.
- **Resolvers, guards e interceptors** para manter responsabilidades bem separadas:
  - resolvers carregam dados iniciais (`clientesResolver`, `logsResolver`),
  - `authGuard` protege rotas sensíveis,
  - interceptors cuidam de loading e auth sem acoplar isso às páginas.

### 10. LGPD e tratamento de dados pessoais (no contexto do teste)

Embora seja um teste simplificado, buscamos refletir boas práticas de privacidade de dados:

- **Máscaras para dados sensíveis**: `maskCpf`, `maskPhone` e `maskEmail` ocultam partes de identificadores pessoais na UI.
- **Diretivas de formatação** (`appCpfFormat`, `appTelefoneFormat`, `appEmailFormat`):
  - aplicam formatação/máscara apenas na camada de apresentação,
  - podem adicionar tooltips controlados, que exibem o valor completo apenas quando apropriado.
- **Storage mínimo**:
  - apenas token e usuário autenticado são persistidos em `localStorage` pelo `AuthService`;
  - dados de clientes/logs permanecem no backend mock (`json-server`).

O objetivo é sinalizar a preocupação com LGPD: evitar expor dados completos sem necessidade e separar bem **dados sensíveis** de **indicadores visuais**.


