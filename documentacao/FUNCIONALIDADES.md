# 📋 Funcionalidades Implementadas

> Versão extraída de `FUNCIONALIDADES.md` na raiz, organizada na pasta `documentacao/`.

## Lista de Clientes (Página Principal)

Conforme especificado no documento de referência, implementamos uma **tela completa de listagem de clientes** com:

### ✅ Funcionalidades Core
- **Lista Paginada / Scrollável:** Tabela PrimeNG com lista otimizada em desktops e cards em mobile.
- **Filtros Avançados:**
  - Busca por texto (nome, CPF, email, telefone, cidade)
  - Filtro por status (Todos/Ativos/Inativos)
- **Estado Preservado:** Filtros e paginação mantidos na URL (queryParams).
- **Ações CRUD:** Botões para editar, excluir e novo cliente (fluxos em evolução).
- **Responsividade:** Layout adaptável (cards mobile + tabela desktop).

### ✅ UX/UI Features
- **Loading States:** Skeleton loading durante carregamento.
- **Empty States:** Mensagens informativas quando não há dados.
- **Feedback Visual:** Toasts para sucesso/erro, tags de status coloridas.
- **Modal de Confirmação:** Confirmação antes da exclusão.
- **Tooltips:** Dicas nas ações da tabela.

## Infraestrutura e Arquitetura (Resumo)

- **Core Module:** Serviços globais, modelos e componentes compartilhados.
- **Pages Module:** Componentes de página roteáveis.
- **Path Aliases:** `@core/*`, `@pages/*` para imports limpos.
- **Docker Environment:** Dev, Testes e Produção em containers.
- **Loading Global:** Interceptor HTTP com empilhamento de requisições.
- **API Mock:** json-server para clientes e logs.

## Estratégia de Testes (Resumo)

- **ClienteService:** CRUD completo + logs automáticos.
- **ListaClientesComponent:** Listagem, filtros, estado, exclusão, tratamento de erros.


