## 🧪 Estratégia de Testes

### 1. Testes Implementados (Jasmine + Karma)

| Camada            | Arquivo                                                   | O que é testado?                                                                                 |
|-------------------|-----------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| Core / Service    | `core/services/cliente.service.spec.ts`                  | CRUD completo, verificação de URLs, métodos HTTP e integração com o sistema de Logs.            |
| Pages / Component | `pages/clientes/lista-clientes/lista-clientes.component.spec.ts` | Listagem, filtros avançados, estado via query params, exclusão, tratamento de erros e utilitários. |

### 2. Ambiente de Execução dos Testes

- Testes rodam em container Docker usando `ChromeHeadlessNoSandbox`.
- Uso de `karma-spec-reporter` para saída detalhada no console (melhor para CI/terminal).
- Ambiente de testes é isolado do desenvolvimento (containers e banco próprios).

### 3. Próximos Testes (Planejados)

- Formulário reativo de cliente (validações, máscaras, mensagens de erro).
- Testes E2E com Cypress cobrindo fluxo completo (cadastro → listagem → edição → exclusão).


