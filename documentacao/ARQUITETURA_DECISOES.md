## 🏛️ Arquitetura & Decisões Técnicas

Este documento detalha as principais decisões arquiteturais adotadas no projeto.

### 1. Path Aliases (@)

Configuramos o `tsconfig.json` para utilizar atalhos de importação (`@models`, `@services`, `@shared`).

- **Motivo**: Eliminar imports relativos longos (`../../../models`) e facilitar refatorações, tornando o código mais legível.

### 2. Estrutura de Pastas (Core & Pages)

Adotamos uma estrutura que separa claramente responsabilidades globais de responsabilidades de apresentação:

- **`src/app/core/`**: Contém singletons, serviços globais, modelos de domínio compartilhados, interceptores, decorators e componentes globais.
- **`src/app/pages/`**: Contém os componentes de página (roteáveis). Cada subpasta representa uma feature/tela do sistema.

### 3. Loading Global Inteligente

Implementamos um sistema de loading global que gerencia automaticamente o estado de carregamento:

- **`LoadingService`**: Serviço singleton que controla o estado global de loading através de BehaviorSubjects.
- **`LoadingInterceptor`**: Interceptor HTTP que empilha requisições automaticamente, ativando/desativando loading conforme necessário.
- **Empilhamento Inteligente**: Gerencia múltiplas requisições simultâneas, só desativando loading quando todas terminarem.

### 4. Logs via Decorator (AOP)

A implementação de logs utiliza o padrão **Decorator** (`@LogOperation`), aplicando conceitos de **Programação Orientada a Aspectos (AOP)**:

- Remove a responsabilidade de logar de dentro da lógica de negócio do Service.
- Mantém o código de CRUD limpo, focado apenas nas chamadas HTTP.

### 5. Docker-First

A aplicação foi desenhada para rodar nativamente em Docker:

- **Motivo**: Garantir que o revisor tenha exatamente o mesmo ambiente de execução do desenvolvedor, eliminando problemas de "funciona na minha máquina" relacionados a versões de Node/OS.

### 6. Execução de Testes em Container

Para viabilizar a execução dos testes unitários dentro do Docker:

- Criamos o *Custom Launcher* `ChromeHeadlessNoSandbox` com a flag `--no-sandbox`.
- Adicionamos o `karma-spec-reporter` para melhorar a visualização dos testes no console.


