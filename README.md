# Teste Técnico - Frontend Angular (PGE)

Este projeto é a solução proposta para o desafio técnico de Front-End, consistindo em um Sistema de Gestão de Clientes com autenticação e registro de logs. O objetivo principal foi demonstrar proficiência nas versões mais recentes do Angular (17+), padrões de arquitetura limpa e estratégias robustas de teste.

Mais do que "só" entregar o CRUD, encarei esse teste como um **estudo guiado** para experimentar o "Angular novo" (standalone, signals, stores locais, interceptors mais inteligentes) em contraste com o jeito "antigo" de organizar projetos. Comecei estruturando o código de um jeito mais tradicional e, aos poucos, fui migrando para o estilo moderno, mantendo uma estrutura de pastas mais "acadêmica" justamente para enxergar com clareza as camadas da arquitetura.

Hoje o projeto está organizado em camadas (`apresentacao`, `negocio`, `dominio`, `infraestrutura`) porque isso me ajudou a raciocinar sobre responsabilidades, mas tenho total consciência de que, no dia a dia, a comunidade Angular tende a preferir uma organização mais voltada a features.
Se eu fosse iniciar um projeto real do zero, muito provavelmente seguiria algo mais próximo deste padrão:

```text
src/app/
  core/
    guards/
    interceptors/
    services/
    config/

  shared/
    components/
    directives/
    pipes/
    utils/

  features/
    clientes/
      pages/
      components/
      services/
      store/           # NgRx ou Signals Store
      clientes.routes.ts

    usuarios/
      pages/
      components/
      services/
      store/
      usuarios.routes.ts

  app.routes.ts
  app.component.ts
```

Ou seja: usei esse teste como sandbox para entender melhor o caminho que o Angular está propondo, e agora consigo transitar com segurança tanto na abordagem “por camadas” quanto na organização “por features”.

---

## 🎯 O Desafio

O desafio consistia em criar uma aplicação SPA (Single Page Application) que permitisse:
1. **Gestão de Clientes:** CRUD completo (Criar, Ler, Atualizar, Deletar) com validações específicas.
2. **Auditoria:** Registro automático de logs das operações realizadas.

O foco não foi apenas "fazer funcionar", mas estruturar uma aplicação escalável, testável e pronta para manutenção a longo prazo.

---

## 🏗️ Decisões Arquiteturais

### Arquitetura em Camadas

Fugi do padrão comum de agrupar tudo por funcionalidades e adotei uma estrutura propositalmente mais "acadêmica" para **evidenciar as camadas da arquitetura** neste teste técnico.

A estrutura ficou dividida da seguinte forma:

- **`src/app/apresentacao` (Camada de Apresentação/UI):**
  Components, pages, directives e pipes responsáveis por renderizar a interface e orquestrar a interação com o usuário.

- **`src/app/negocio` (Camada de Aplicação/Regras de Negócio):**
  Casos de uso (UseCases) e orquestrações de fluxo da aplicação. Aqui não há detalhes de UI nem de infraestrutura.

- **`src/app/dominio` (Camada de Domínio):**
  Modelos, enums e validações de domínio. Código o mais puro possível, sem dependência de Angular/HTTP.

- **`src/app/infraestrutura` (Camada de Infraestrutura):**
  Implementações técnicas: serviços HTTP, interceptors, guards, resolvers e outros adapters que falam com APIs e recursos externos.

#### Diagrama de Camadas

A arquitetura segue o princípio de **dependência unidirecional**, onde camadas superiores dependem apenas de camadas inferiores:

```
┌─────────────────────────────────────────────────────────────┐
│                    APRESENTAÇÃO (UI)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Components   │  │   Pages      │  │   Stores     │      │
│  │ Directives   │  │   Pipes      │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │            │
│         └──────────────────┼──────────────────┘            │
│                            │                                │
│                            ▼                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ usa
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEGÓCIO (Use Cases)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ManterClienteUseCase                                 │  │
│  │  - Encapsula regras de negócio                        │  │
│  │  - Orquestra fluxos de aplicação                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │                                │
│                            │ usa                            │
│                            ▼                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ usa
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  INFRAESTRUTURA (Adapters)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Services    │  │ Interceptors │  │   Guards     │     │
│  │  (HTTP)      │  │  (Auth,      │  │  (Routes)    │     │
│  │              │  │   Loading)   │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │           │
│         └──────────────────┼──────────────────┘           │
│                            │                               │
│                            │ usa                           │
│                            ▼                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ usa
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DOMÍNIO (Core)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Models     │  │   Enums      │  │ Validators   │     │
│  │   (Cliente)  │  │   (Status)   │  │  (CPF, Data) │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                            │
│  ⚠️ SEM dependências de Angular, HTTP ou frameworks        │
└─────────────────────────────────────────────────────────────┘
```

#### Benefícios desta Arquitetura

- **Testabilidade:** Cada camada pode ser testada isoladamente usando mocks das camadas inferiores
- **Manutenibilidade:** Mudanças em uma camada não afetam outras (ex: trocar API não afeta UI)
- **Reutilização:** Lógica de negócio e domínio podem ser reutilizadas em diferentes contextos
- **Clareza:** Fica explícito onde cada responsabilidade deve estar

### Reatividade Moderna (Angular 17+)

Abandonei a dependência excessiva de subscriptions manuais e `ngOnChanges`:
- **Signals & Computed:** Usados extensivamente para gerenciamento de estado local e derivado, garantindo renderização fina e performática.
- **Subjects:** Mantidos apenas onde necessário para compatibilidade ou fluxos de eventos específicos, mas encapsulados.
- **Formulários Reativos:** Para validações complexas e feedback visual imediato.

### UI/UX e Estilização

- **Hierarquia Visual & Padrão de Leitura:** A interface foi desenhada respeitando o padrão ocidental de leitura (esquerda para direita, cima para baixo). Elementos críticos e botões de ação primária ("Salvar", "Login") foram estrategicamente posicionados para serem os primeiros elementos de interação percebidos ou seguirem o fluxo natural de encerramento de formulário.
- **PrimeFlex:** Escolha pragmática pela produtividade e velocidade de desenvolvimento que oferece em um teste técnico.
- **PrimeNG:** Utilizado para componentes ricos (Tabelas, Modais), customizados via Tokens de Design.

### Boas Práticas de Roteamento

- **Lazy Loading:** Todas as rotas principais são carregadas sob demanda para performance inicial.
- **Auth Guards:** Proteção de rotas administrativas.
- **Resolvers:** Garantem que os dados críticos estejam disponíveis antes do componente ser renderizado, evitando "flickering" de tela vazia.

### Padrões e Convenções

- **Dependency Injection:** Serviços injetados via construtor ou `inject()`
- **Decorators:** `@LogOperation` para registro automático de operações CRUD
- **JSDoc:** Documentação de APIs públicas quando necessário
- **Formulários Tipados:** Uso de `FormGroup` tipado para garantir type-safety
- **Validators Centralizados:** Validators customizados no domínio

---

## 🐳 Como Executar com Docker

O projeto inclui uma configuração completa do Docker Compose que permite executar todo o ambiente de desenvolvimento e testes dentro de containers Docker, garantindo consistência e isolamento.

### Pré-requisitos

- Docker e Docker Compose instalados

### Comandos Principais

#### Aplicação (Angular + JSON Server)

```bash
./docker/scripts.sh up
```

- **Angular:** http://localhost:4200
- **JSON Server:** http://localhost:3000

#### Testes Unitários (Karma)

**Headless com cobertura:**
```bash
./docker/scripts.sh test
```

Relatório de cobertura: `coverage/teste-pge/index.html` (abra no navegador)

**Modo remoto (browser local):**
```bash
./docker/scripts.sh test:remote
```

Acesse `http://localhost:9876` e clique em **Debug** para capturar o browser.

#### Testes E2E (Cypress)

**Com browser via VNC (tudo no Docker):**
```bash
./docker/scripts.sh cypress
```

Acesse `http://localhost:6080/vnc.html` (senha: `cypress`), escolha o browser (Chrome) e rode os specs.

**Headless:**
```bash
./docker/scripts.sh cypress:headless
```

**Browser local (opcional):**
```bash
docker-compose --profile tests up angular-cypress json-server-cypress
npm install
CYPRESS_baseUrl=http://localhost:4201 npx cypress open
```

#### Parar serviços

```bash
./docker/scripts.sh down
```

### Documentação Completa

- **Guia rápido:** [docker/QUICKSTART.md](./docker/QUICKSTART.md)
- **Documentação completa:** [docker/README.md](./docker/README.md)

---

## ✅ Estratégia de Testes

A qualidade foi assegurada através de uma pirâmide de testes diversificada, cobrindo diferentes camadas da aplicação.

**Isolamento e Concorrência:** Os testes foram projetados para serem totalmente independentes (atômicos). Cada teste cria e destrói seu próprio cenário, garantindo que não haja vazamento de estado ou efeitos colaterais entre eles.

| Camada | Ferramentas | Foco do Teste |
|:--- |:--- |:--- |
| **Fluxo Completo (E2E)** | **Cypress** | Simula o usuário real: Login -> Navegação -> Cadastro de Cliente -> Logout. Garante que o sistema funciona como um todo. |
| **UI + Interação** | **Karma & Jasmine** | Testa se os componentes renderizam, se os botões chamam as funções corretas e se o feedback visual aparece. |
| **Store (Estado)** | **Karma & Jasmine** | Valida a lógica de estado (Signals), garantindo que ações atualizem a store corretamente. |
| **Use Case (Regra)** | **Karma & Jasmine** | Testa as regras de negócio puras isoladas da interface e da infraestrutura. |

---

## 🔒 Dados Pessoais e LGPD

Mesmo sendo um projeto de teste, tratei os dados como se fossem reais, pensando em **boas práticas de privacidade**:

- **Dados mascarados na UI:** E-mails, telefones e CPF são exibidos com máscaras (`MaskEmailPipe`, `MaskPhonePipe`, `MaskCpfPipe`) para evitar exposição desnecessária de dados sensíveis na tela.
- **Mocks isolados:** O `json-server` usa bases de teste (`db.test.json`) com dados fictícios, evitando qualquer dependência de informações reais.
- **Logs conscientes:** A camada de logs (`LogService` + `@LogOperation`) registra apenas o necessário para auditoria (quem fez o quê e quando), sem despejar payloads completos ou informações excessivas.

Ou seja, mesmo em um contexto de prova de conceito, a ideia foi sempre aproximar o máximo possível das preocupações que a LGPD exige em produção: minimização de dados, mascaramento quando possível e rastreabilidade sem exposição desnecessária.

---

## 📝 Execução Local (Opcional)

Se preferir executar localmente sem Docker:

### Pré-requisitos

- Node.js 18+ instalado
- npm (geralmente vem com o Node.js)
- Portas 4200 (Angular) e 3000 (JSON Server) disponíveis

### Instalação

```bash
npm install
```

### Executar

```bash
npm run start:dev
```

Este comando inicia o Angular em `http://localhost:4200` e o JSON Server em `http://localhost:3000`.

### Testes

**Unitários:**
```bash
npm run test
```

**E2E:**
```bash
npm run e2e
```

**Build:**
```bash
npm run build:prod
```
