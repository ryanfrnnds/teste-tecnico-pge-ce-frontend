# ✅ Comparativo de Requisitos do Teste x Implementação Atual

Baseado no documento de referência  
`Teste Prático - Desenvolvedor - Front-End - Procuradoria Geral do Estado do Ceará.pdf`.

## 1. Reatividade, Validações e Máscaras (Formulário de Cliente)

- **Requisito do documento:**
  - Formulário de cadastro de cliente com Reactive Forms, validações, máscaras (CPF, telefone), data de nascimento, país/estado dinâmicos.
  - Ao menos **uma validação com diretiva** personalizada.
- **Status no projeto:** ❌ **PENDENTE (Formulário)** / ✅ **PARCIAL (Diretivas)**
  - A tela de formulário de cadastro/edição de cliente ainda não foi implementada.
  - Já existem **diretivas de formatação** em `core/directives`:
    - `CpfFormatDirective` (`appCpfFormat`): formata CPF como `999.999.999-99`.
    - `TelefoneFormatDirective` (`appTelefoneFormat`): formata telefone como `(+99) 99999-9999` (padrão BR).

## 2. Listagem e Controle de Estado

- **Requisito do documento:**
  - Página com **lista paginada** de clientes.
  - Filtros por **nome** e **cidade**.
  - Estado preservado ao navegar entre páginas.
- **Status no projeto:** ✅ **IMPLEMENTADO (com adaptações)**
  - Listagem de clientes (`pages/clientes/lista-clientes`):
    - Desktop: tabela PrimeNG com **scroll interno** ocupando o restante da tela.
    - Mobile: cards responsivos para cada cliente.
  - Filtros:
    - Busca por texto filtrando **nome, CPF, email, telefone e cidade**.
    - Filtro de status (`Todos / Ativos / Inativos`).
  - Estado:
    - Filtros e parâmetros de navegação são preservados na URL (`queryParams`).

## 3. Componentização e Reuso (Modal de Confirmação)

- **Requisito do documento:**
  - Componente de modal de confirmação reutilizável.
- **Status no projeto:** ✅ **IMPLEMENTADO**
  - `ConfirmModalComponent` em `core/components/confirm-modal`.

## 4. Integração com API (HTTP + Interceptors)

- **Requisito do documento:**
  - Consumir API REST para listar/criar/editar/deletar itens, com feedback ao usuário.
- **Status no projeto:** ✅ **IMPLEMENTADO**
  - API mock com `json-server` (`/clientes` e `/logs`).
  - `ClienteService` e `LogService` fazem o CRUD e registro de logs.
  - `LoadingInterceptor` controla loading global.

## 5. Observabilidade e Feedbacks

- **Requisito do documento:**
  - Serviço de logging centralizado e toasts de feedback.
- **Status no projeto:** ✅ **IMPLEMENTADO**
  - `LogService`, `LoggerService` e decorator `@LogOperation`.
  - Toasts padronizados com estilos customizados.

## 6. Testes Automatizados

- **Requisito do documento:**
  - Testes unitários para componentes e lógica condicional.
- **Status no projeto:** ✅ **IMPLEMENTADO (Listagem & Services)** / ❌ **PENDENTE (Formulário & E2E)**
  - Testes para `ClienteService` e `ListaClientesComponent`.
  - Ambiente de testes em Docker com `ChromeHeadlessNoSandbox`.

## Resumo por Seção

| Seção do PDF | Tópico                                    | Status atual                                |
|--------------|-------------------------------------------|---------------------------------------------|
| 1            | Formulário reativo + máscaras + diretiva  | ❌ Formulário / ✅ Diretivas (formatação)   |
| 2            | Listagem + filtros + estado               | ✅ Implementado (scroll interno)            |
| 3            | Modal de confirmação reutilizável         | ✅ Implementado                             |
| 4            | Integração HTTP + Interceptors + feedback | ✅ Implementado                             |
| 5            | Observabilidade (logs + toasts)           | ✅ Implementado                             |
| 6            | Testes automatizados                      | ✅ Lista/Services / ❌ Formulário/E2E       |


