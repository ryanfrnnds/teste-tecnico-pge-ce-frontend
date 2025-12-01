# ✅ Comparativo de Requisitos do Teste x Implementação Atual

Baseado no documento de referência  
`Teste Prático - Desenvolvedor - Front-End - Procuradoria Geral do Estado do Ceará.pdf`.

## 1. Reatividade, Validações e Máscaras (Formulário de Cliente)

- **Requisito do documento ([PDF oficial](../referencias/Teste%20Pr%C3%A1tico%20-%20Desenvolvedor%20-%20Front-End%20-%20Procuradoria%20Geral%20do%20Estado%20do%20Cear%C3%A1.pdf)):**
  - Formulário de cadastro de cliente com Reactive Forms, validações, máscaras (CPF, telefone), data de nascimento, país/estado dinâmicos.
  - Ao menos **uma validação com diretiva** personalizada.
- **Status no projeto:** ❌ **PENDENTE (Formulário de cadastro/edição de cliente)** / ✅ **PARCIAL (Diretivas, máscaras e formulário de login)**
  - A tela de formulário de cadastro/edição de **cliente** ainda não foi implementada.
  - Já existem **diretivas de formatação** em `core/directives`:
    - `CpfFormatDirective` (`appCpfFormat`): formata CPF como `999.999.999-99` e suporta exibição mascarada/tooltip.
    - `TelefoneFormatDirective` (`appTelefoneFormat`): formata telefone como padrão brasileiro (celular/fixo) com suporte a máscara/tooltip.
    - `EmailFormatDirective` (`appEmailFormat`): aplica máscara parcial de e-mail, focada em privacidade (LGPD).
  - Existem também **pipes de máscara** em `core/pipes` (`maskCpf`, `maskPhone`, `maskEmail`) aplicados na listagem, reforçando o cuidado com dados pessoais.
  - O **formulário de login** (`pages/auth/login`) já foi implementado com **Reactive Forms**, validações obrigatórias e feedback visual de erro, servindo como prova de conceito do uso de Reactive Forms no projeto (ainda que não seja o formulário de cliente exigido pelo PDF.

## 2. Listagem e Controle de Estado

- **Requisito do documento:**
  - Página com **lista paginada** de clientes.
  - Filtros por **nome** e **cidade**.
  - Estado preservado ao navegar entre páginas.
- **Status no projeto:** ✅ **IMPLEMENTADO (com extensões além do requisito)**
  - Listagem de clientes (`pages/clientes/lista-clientes`):
    - Desktop: tabela PrimeNG com **scroll interno** ocupando o restante da tela e paginação controlada pela store.
    - Mobile: cards responsivos para cada cliente.
  - Filtros:
    - Busca por texto com campos específicos para **nome** e **cidade** (Reactive Forms).
    - Filtro de status (`Todos / Ativos / Inativos`) com contadores por status.
  - Estado:
    - Filtros e parâmetros de navegação são preservados na URL (**`queryParams`**) e também em `sessionStorage`, permitindo recarregar a página ou navegar para outras telas (ex.: logs) sem perder o estado.
  - Há ainda um **teste E2E com Cypress** (`cypress/e2e/clientes-lista.cy.ts`) que valida na prática a preservação de estado via query params, filtros, paginação, filtros de status, exclusão/reativação e navegação entre rotas.

## 3. Componentização e Reuso (Modal de Confirmação)

- **Requisito do documento:**
  - Componente de modal de confirmação reutilizável.
- **Status no projeto:** ✅ **IMPLEMENTADO**
  - `ConfirmModalComponent` em `core/components/confirm-modal`, que:
    - recebe título, mensagem, severidade e visibilidade via propriedades;
    - expõe eventos de confirmação/cancelamento via `@Output`;
    - é reutilizado na listagem de clientes para exclusão simples e exclusão/reativação em massa.

## 4. Integração com API (HTTP + Interceptors)

- **Requisito do documento:**
  - Consumir API REST para listar/criar/editar/deletar itens, com feedback ao usuário.
- **Status no projeto:** ✅ **IMPLEMENTADO**
  - API mock com `json-server` (`/clientes`, `/logs` e `/auth/login`).
  - `ClienteService` e `LogService` fazem o CRUD e registro de logs.
  - `AuthService` consome `/api/auth/login`, persiste token/usuário e integra com o restante do sistema.
  - `LoadingInterceptor` controla loading global de requisições `/api`, empilhando requisições e ignorando assets estáticos.

## 5. Observabilidade e Feedbacks

- **Requisito do documento:**
  - Serviço de logging centralizado e toasts de feedback.
- **Status no projeto:** ✅ **IMPLEMENTADO**
  - `LogService`, `LoggerService` e decorator `@LogOperation`, com logs registrados tanto pelo sistema (`usuario: "system"`) quanto pelo usuário autenticado (`AuthService.usuario`).
  - Toasts padronizados com estilos customizados (`p-toast` + `assets/primeng/toast.scss`) para sucesso/erro/info/warn.

## 6. Testes Automatizados

- **Requisito do documento:**
  - Testes unitários para componentes e lógica condicional.
- **Status no projeto:** ✅ **IMPLEMENTADO (Serviços, guards, resolvers, pipes e páginas principais)** / ✅ **PARCIAL (E2E)** / ❌ **PENDENTE (Formulário de cliente)**
  - **Testes unitários em `core`:**
    - `ClienteService`, `LoadingService`, `AuthService`, `LogService`, `LoggerService`.
    - `LoadingInterceptor`.
    - Pipes de máscara (`maskCpf`, `maskPhone`, `maskEmail`).
    - `authGuard`, `clientesResolver`, `logsResolver`.
  - **Testes unitários em `pages`:**
    - `ListaClientesComponent` e `ListaClientesStore`.
    - `LoginComponent`.
    - `ListaLogsStore`.
  - **Testes E2E (Cypress)**:
    - `cypress/e2e/clientes-lista.cy.ts` cobre o fluxo principal da **lista de clientes** (login, filtros, query params, paginação, filtros de status, exclusão simples/em massa, reativação e navegação entre telas).
  - **Ainda pendente**:
    - Testes de formulário de cadastro/edição de cliente.
    - Fluxos E2E envolvendo um formulário completo de cliente (cadastro → edição → exclusão).

## Resumo por Seção

| Seção do PDF | Tópico                                    | Status atual                                |
|--------------|-------------------------------------------|---------------------------------------------|
| 1            | Formulário reativo + máscaras + diretiva  | ❌ Formulário / ✅ Diretivas (formatação)   |
| 2            | Listagem + filtros + estado               | ✅ Implementado (scroll interno)            |
| 3            | Modal de confirmação reutilizável         | ✅ Implementado                             |
| 4            | Integração HTTP + Interceptors + feedback | ✅ Implementado                             |
| 5            | Observabilidade (logs + toasts)           | ✅ Implementado                             |
| 6            | Testes automatizados                      | ✅ Core/Pages + E2E lista / ❌ Formulário   |


