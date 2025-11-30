# 📋 Funcionalidades Implementadas

## Lista de Clientes (Página Principal)

Conforme especificado no documento de referência, implementamos uma **tela completa de listagem de clientes** com:

### ✅ Funcionalidades Core
- **Lista Paginada:** Tabela PrimeNG com paginação configurável (5, 10, 25, 50 registros por página)
- **Filtros Avançados:**
  - Busca por texto (nome, CPF, email, telefone, cidade)
  - Filtro por status (Todos/Ativos/Inativos)
- **Estado Preservado:** Todos os filtros e paginação são mantidos na URL (queryParams)
- **Ações CRUD:** Botões para editar, excluir e novo cliente
- **Responsividade:** Layout adaptável (cards mobile + tabela desktop)

### ✅ UX/UI Features
- **Loading States:** Skeleton loading durante carregamento
- **Empty States:** Mensagens informativas quando não há dados
- **Feedback Visual:** Toasts para sucesso/erro, tags de status coloridas
- **Modal de Confirmação:** Confirmação antes da exclusão
- **Tooltips:** Dicas nas ações da tabela

### ✅ Estado e Navegação
- **Query Params:** Filtros e paginação salvos na URL
- **Navegação Segura:** Estado mantido ao voltar da navegação
- **Reset Automático:** Pagina atual reseta se necessário após filtros

---

## Infraestrutura e Arquitetura

### 🏗️ Estrutura do Projeto
- **Core Module:** Serviços globais, modelos e componentes compartilhados
- **Pages Module:** Componentes de página roteáveis
- **Path Aliases:** `@core/*`, `@pages/*` para imports limpos

### 🐳 Docker Environment
- **Desenvolvimento:** Ambiente containerizado com hot-reload
- **Testes:** Execução isolada em containers efêmeros
- **Produção:** Build otimizado com Nginx

### 🔄 Loading Global Inteligente
- **Interceptor HTTP:** Controle automático de loading para todas as requisições API
- **Empilhamento Inteligente:** Gerencia múltiplas requisições simultâneas
- **Estado Global:** Loading compartilhado entre componentes (única tela visível)
- **Performance:** Não interfere com carregamento de assets estáticos

### 📊 API Mock (json-server)
- **CRUD Completo:** Clientes e logs
- **Persistencia em Memória:** Dados resetados a cada restart
- **Proxy Configuration:** CORS resolvido via Angular dev server

### 🔧 Scripts de Automação
- **start/stop/update:** Controle do ambiente de desenvolvimento
- **test:** Execução de testes unitários em ambiente isolado
- **test-watch:** Debug visual de testes por 10 minutos
- **full-remove:** Limpeza completa de containers e volumes

### 🎨 Organização de Estilos (SCSS)
- **`src/styles.scss`** (entrypoint global):
  - `@use './assets/themes/design-tokens.scss' as *;` → carrega todos os tokens `--pge-*`.
  - `@use './assets/styles/utilities.scss' as *;` → utilitárias globais (layout, espaçamento, tipografia).
  - `@use './assets/primeng/toast.scss';` → overrides específicos do componente Toast do PrimeNG.
- **Tema / Tokens:**
  - `src/assets/styles/design-tokens.scss`: define as variáveis CSS em `:root` (cores, tipografia, espaçamentos, sombras, etc).
  - `src/assets/themes/design-tokens.scss`: apenas faz `@forward '../styles/design-tokens.scss';` para facilitar o consumo pelo tema.
  - `src/assets/themes/pge-theme.ts`: preset `PGETheme` extendendo o tema Aura do PrimeNG com ajustes para a identidade visual da PGE-CE.
- **PrimeNG Custom:**
  - `src/assets/primeng/toast.scss`: posicionamento (bottom-center), borda lateral colorida por severidade, ícone circular e tipografia do Toast.
- **Utilitárias:**
  - `src/assets/styles/utilities.scss`: classes como `container`, `d-flex`, `text-sm`, `bg-primary`, `shadow-md`, etc.
  - **Sem `!important`**: as classes respeitam a cascata normal do CSS e podem ser sobrescritas em SCSS de componentes.

---

## Estratégia de Testes

### ✅ Testes Unitários (Jasmine + Karma)
- **ClienteService:** CRUD completo + logs automáticos
- **ListaClientesComponent:** Listagem, filtros, paginação, exclusão
- **Cobertura:** Estados, navegação, tratamento de erros

### 🎯 Testes Planejados
- **Formulário Reativo:** Validação, máscaras, mensagens de erro
- **Integração E2E:** Cypress para fluxos completos

---

## Temas Claro/Escuro

### 🌗 Modo Escuro (Padrão)
- A aplicação inicia em **tema escuro** por padrão.
- O `ThemeService` aplica a classe `dark-mode` no elemento raiz (`documentElement`), integrado ao `darkModeSelector: '.dark-mode'` configurado no `providePrimeNG`.
- A preferência do usuário é persistida em `localStorage` (`pge-theme-mode`) e restaurada em novos acessos.

### ☀️ Alternância de Tema
- Serviço central: `ThemeService` (`core/services/theme.service.ts`):
  - Expõe `modo$` (`'light' | 'dark'`) via `BehaviorSubject`.
  - Métodos: `alternarTema()` e `definirTema(modo)`.
  - Responsável por adicionar/remover `dark-mode` e salvar a escolha.
- UI:
  - Botão de toggle no `HeaderComponent` com ícones `pi-sun` / `pi-moon` e rótulos **Claro/Escuro**.
  - O header apenas consome o `ThemeService`, mantendo a lógica de tema centralizada.

---

## Tecnologias Utilizadas

- **Angular 19:** Framework principal (Standalone Components)
- **PrimeNG 19:** Componentes UI + PrimeFlex para layout
- **TypeScript:** Tipagem estática e path aliases
- **RxJS:** Programação reativa para operações assíncronas
- **Docker:** Containerização completa do ambiente
- **json-server:** Mock API REST para desenvolvimento
