# Teste Técnico - Frontend Angular (PGE)

Este projeto é a solução proposta para o desafio técnico de Front-End, consistindo em um Sistema de Gestão de Clientes com autenticação e registro de logs. O meu objetivo principal foi demonstrar proficiência nas versões mais recentes do Angular (17+), padrões de arquitetura limpa e estratégias robustas de teste.

Mais do que “só” entregar o CRUD, encarei esse teste como um **estudo guiado** para experimentar o “Angular novo” (standalone, signals, stores locais, interceptors mais inteligentes) em contraste com o jeito “antigo” de organizar projetos.  
Comecei estruturando o código de um jeito mais tradicional e, aos poucos, fui migrando para o estilo moderno, mantendo uma estrutura de pastas mais “acadêmica” justamente para enxergar com clareza as camadas da arquitetura.

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

## 🏗️ Decisões Arquiteturais e Técnicas

Para atender aos requisitos com excelência, adotei diversas decisões estratégicas:

### 1. Suporte Docker Completo

O projeto agora inclui uma configuração completa do Docker Compose com suporte a:
- **Desenvolvimento:** Angular Dev Server + JSON Server
- **Testes Unitários (Karma):** Com interface web acessível em `http://localhost:9876`
- **Testes E2E (Cypress):** Com visualização do browser via VNC (acesse `http://localhost:6080/vnc.html`)

**Benefícios:**
- **Consistência:** Ambiente idêntico para todos os desenvolvedores, independentemente do sistema operacional
- **Isolamento:** Não interfere com instalações locais do Node.js
- **Visualização completa:** Browsers funcionando perfeitamente via VNC para Cypress e interface web para Karma

**Como usar:**
Veja a documentação completa em [docker/README.md](./docker/README.md) ou o guia rápido em [docker/QUICKSTART.md](./docker/QUICKSTART.md).

**Nota:** Preferencialmente use Docker. O uso local com `npm` permanece descrito mais adiante, mas priorize os comandos Docker abaixo.

---

## 🚀 Como executar com Docker (preferencial)

### App + JSON Server (aplicação)
```bash
./docker/scripts.sh up
# Angular: http://localhost:4200
# JSON Server (aplicação): http://localhost:3000
```

### Karma
- Headless + coverage:
```bash
./docker/scripts.sh test
```
Relatório: `coverage/teste-pge/index.html` (abra no navegador).

- Modo remoto (browser local via capture):
```bash
./docker/scripts.sh test:remote
```
Acesse `http://localhost:9876` e clique em **Debug** para capturar o browser.

### Cypress
<!-- - Browser via VNC (tudo no Docker):  AINDA NAO CONSEGUI FAZER FUNCIONAR COM VNC...
```bash
./docker/scripts.sh cypress
```
Acesse `http://localhost:6080/vnc.html` (senha: `cypress`), escolha o browser (Chrome) e rode os specs. -->

- Sem browser
```bash
./docker/scripts.sh cypress:headless
```

- Browser local (opcional - caso o VNC nao funcione.):
```bash
docker-compose --profile tests up angular-cypress json-server-cypress
npm install
CYPRESS_baseUrl=http://localhost:4201 npx cypress open
```

### Parar
```bash
./docker/scripts.sh down
```

### 1. Arquitetura em Camadas e Organização das Pastas

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

#### Diagrama de Camadas e Fluxo de Comunicação

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

#### Regras de Comunicação entre Camadas

**1. Apresentação → Negócio → Infraestrutura → Domínio**
   - Fluxo principal: A camada de apresentação (Stores) chama Use Cases, que por sua vez utilizam serviços de infraestrutura
   - **Exemplo prático:**
     ```typescript
     // ClienteFormStore (Apresentação)
     this.manterClienteUseCase.execute(cliente, isEdicao)
       ↓
     // ManterClienteUseCase (Negócio)
     this.clienteService.criar(cliente) ou this.clienteService.atualizarCliente(cliente)
       ↓
     // ClienteService (Infraestrutura)
     this.http.post<Cliente>('/api/clientes', cliente)
       ↓
     // Cliente (Domínio) - modelo usado em todas as camadas
     ```

**2. Domínio é Independente**
   - A camada de domínio **não depende** de nenhuma outra camada
   - Contém apenas modelos, enums e validadores puros (sem Angular, sem HTTP)
   - Pode ser reutilizada em qualquer contexto (web, mobile, backend)

**3. Infraestrutura → Domínio**
   - Serviços de infraestrutura usam modelos do domínio para tipagem
   - Interceptors e guards podem usar enums e validadores do domínio

**4. Apresentação → Domínio**
   - Components e Stores usam modelos e validadores do domínio diretamente
   - Exemplo: `ClienteFormStore` usa `Cliente` (model) e `cpfBasicoValidator` (validador)

**5. Exceções Práticas**
   - **Stores podem acessar Infraestrutura diretamente** para casos específicos (ex: `LocalizacaoService` para buscar CEP)
   - Isso é uma flexibilidade pragmática, mas o ideal é sempre passar por Use Cases quando há regra de negócio

#### Benefícios desta Arquitetura

- **Testabilidade:** Cada camada pode ser testada isoladamente usando mocks das camadas inferiores
- **Manutenibilidade:** Mudanças em uma camada não afetam outras (ex: trocar API não afeta UI)
- **Reutilização:** Lógica de negócio e domínio podem ser reutilizadas em diferentes contextos
- **Clareza:** Fica explícito onde cada responsabilidade deve estar

### 2. Reatividade Moderna (Angular 17+)
Abandonei a dependência excessiva de subscriptions manuais e `ngOnChanges`:
- **Signals & Computed:** Usados extensivamente para gerenciamento de estado local e derivado, garantindo renderização fina e performática.
- **Subjects:** Mantidos apenas onde necessário para compatibilidade ou fluxos de eventos específicos, mas encapsulados.
- **Formulários Reativos:** Para validações complexas e feedback visual imediato.

### 3. UI/UX e Estilização
- **Hierarquia Visual & Padrão de Leitura:** A interface foi desenhada respeitando o padrão ocidental de leitura (esquerda para direita, cima para baixo). Elementos críticos e botões de ação primária ("Salvar", "Login") foram estrategicamente posicionados para serem os primeiros elementos de interação percebidos ou seguirem o fluxo natural de encerramento de formulário.
- **PrimeFlex (Escolha Pragmática):** Optei pelo PrimeFlex pela produtividade e velocidade de desenvolvimento que ele oferece em um teste técnico. *Nota:* Reconheço que para projetos de médio/longo prazo, a recomendação atual seria o uso de Tailwind CSS ou CSS puro com Grid/Flexbox, visto que o PrimeFlex entrou em modo de manutenção.
- **SCSS Organizado:** Tentei estruturar o SCSS seguindo as convenções do Angular e PrimeNG, mantendo estilos globais em `styles/` e específicos nos componentes.
- **PrimeNG:** Utilizado para componentes ricos (Tabelas, Modais), customizados via Tokens de Design.
- **Uso de `!important`:** Em alguns pontos do SCSS recorri ao `!important` para acelerar ajustes visuais durante o estudo. Eu não considero isso uma boa prática para projetos de longo prazo e, em um cenário real, substituiria por uma hierarquia de estilos mais bem pensada (design tokens, utilitários e sobrescritas bem localizadas).

### 4. Boas Práticas de Roteamento
- **Lazy Loading:** Todas as rotas principais são carregadas sob demanda para performance inicial.
- **Auth Guards:** Proteção de rotas administrativas.
- **Resolvers:** Garantem que os dados críticos estejam disponíveis antes do componente ser renderizado, evitando "flickering" de tela vazia.

### 5. Padrões e Boas Práticas do Projeto

Este projeto segue um conjunto de padrões e convenções para garantir consistência, manutenibilidade e qualidade do código:

#### Arquitetura em Camadas
A base arquitetural do projeto é a **separação em camadas** (`apresentacao`, `dominio`, `negocio`, `infraestrutura`), garantindo:
- **Separação de responsabilidades:** Cada camada tem um propósito bem definido
- **Baixo acoplamento:** Camadas superiores dependem apenas de abstrações das camadas inferiores
- **Testabilidade:** Facilita a criação de testes isolados e mocks

#### Inversão de Dependências (Dependency Injection)
O projeto utiliza extensivamente o sistema de **Dependency Injection (DI)** do Angular:
- **Serviços injetados via construtor ou `inject()`:** Todos os serviços são fornecidos através do sistema de DI do Angular
- **Abstrações sobre implementações:** Use Cases dependem de interfaces de serviços, não de implementações concretas
- **Testabilidade aprimorada:** Facilita a substituição de dependências por mocks em testes

#### Decorators
Utilizamos decorators para adicionar funcionalidades transversais de forma declarativa:
- **`@LogOperation`:** Decorator customizado que registra automaticamente operações CRUD no sistema de logs, aplicado em métodos de serviços que retornam Observables
- **Decorators do Angular:** `@Injectable()`, `@Component()`, `@Pipe()` para definir metadados das classes

#### Documentação de Código
- **JSDoc para APIs públicas:** Métodos e classes públicas possuem documentação JSDoc quando necessário para explicar comportamento complexo ou não óbvio
- **Código autoexplicativo:** Priorizamos código claro e expressivo ao invés de comentários desnecessários. Se um comentário é necessário, provavelmente o código pode ser melhorado
- **Nomes descritivos:** Variáveis, métodos e classes possuem nomes que deixam claro sua intenção

#### Gerenciamento de Estado
- **Signals para estado local:** Uso de `signal()` e `computed()` para estado reativo local em Stores
- **Observables para fluxos assíncronos:** RxJS para operações HTTP e eventos de fluxo
- **Stores locais por feature:** Cada feature possui sua própria Store para gerenciar estado específico

#### Formulários Reativos
- **Validações centralizadas:** Validators customizados no domínio (`@dominio/validacoes`)
- **Feedback visual imediato:** Validações síncronas e assíncronas com feedback visual através de classes CSS
- **Formulários tipados:** Uso de `FormGroup` tipado para garantir type-safety

#### Testes
- **Testes isolados e atômicos:** Cada teste é independente e não depende de estado externo
- **Mocks e Spies:** Uso de `jasmine.SpyObj` para mockar dependências
- **Cobertura de camadas:** Testes unitários para Stores, Services, Use Cases e componentes

---

## 🔒 Dados Pessoais e LGPD

Mesmo sendo um projeto de teste, tratei os dados como se fossem reais, pensando em **boas práticas de privacidade**:

- **Dados mascarados na UI:** E-mails, telefones e CPF são exibidos com máscaras (`MaskEmailPipe`, `MaskPhonePipe`, `MaskCpfPipe`) para evitar exposição desnecessária de dados sensíveis na tela.
- **Mocks isolados:** O `json-server` usa bases de teste (`db.test.json`) com dados fictícios, evitando qualquer dependência de informações reais.
- **Logs conscientes:** A camada de logs (`LogService` + `@LogOperation`) registra apenas o necessário para auditoria (quem fez o quê e quando), sem despejar payloads completos ou informações excessivas.

Ou seja, mesmo em um contexto de prova de conceito, a ideia foi sempre aproximar o máximo possível das preocupações que a LGPD exige em produção: minimização de dados, mascaramento quando possível e rastreabilidade sem exposição desnecessária.

## ✅ Estratégia de Testes

A qualidade foi assegurada através de uma pirâmide de testes diversificada, cobrindo diferentes camadas da aplicação.

**Isolamento e Concorrência:** Um ponto de destaque é que os testes foram projetados para serem totalmente independentes (atômicos). Cada teste cria e destrói seu próprio cenário, garantindo que não haja vazamento de estado ou efeitos colaterais (side-effects) entre eles. Isso permite uma execução segura e livre de concorrência, facilitando a detecção de falhas reais.

| Camada | Ferramentas | Foco do Teste |
|:--- |:--- |:--- |
| **Fluxo Completo (E2E)** | **Cypress** | Simula o usuário real: Login -> Navegação -> Cadastro de Cliente -> Logout. Garante que o sistema funciona como um todo. |
| **UI + Interação** | **Karma & Jasmine** | Testa se os componentes renderizam, se os botões chamam as funções corretas e se o feedback visual aparece. |
| **Store (Estado)** | **Karma & Jasmine** | Valida a lógica de estado (Signals), garantindo que ações atualizem a store corretamente. |
| **Use Case (Regra)** | **Karma & Jasmine** | Testa as regras de negócio puras isoladas da interface e da infraestrutura. |

---

## 🚀 Como Executar Localmente (Opcional) - Abaixo tem a versao com DOCKER

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior) - **Recomendamos usar o NVM (Node Version Manager)** para gerenciar múltiplas versões do Node.js de forma prática e organizada:
  - **Windows:** [nvm-windows](https://github.com/coreybutler/nvm-windows) - [Download](https://github.com/coreybutler/nvm-windows/releases)
  - **Linux/Mac:** [nvm](https://github.com/nvm-sh/nvm) - Instalação via curl: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`
  - **Alternativa:** Se preferir, pode instalar diretamente do [site oficial](https://nodejs.org/)
- **npm** (geralmente vem com o Node.js)
- **Electron** (vem incluído com o Cypress) - Recomendado para execução dos testes E2E, pois não exibe avisos de senha insegura do Chrome, tornando os testes mais limpos. O Cypress usa Electron por padrão quando você executa `npm run e2e`.

### Instalação

1. **Clone o repositório** (se ainda não tiver feito):
   ```bash
   git clone https://github.com/ryanfrnnds/teste-tecnico-pge-ce-frontend.git
   cd teste-tecnico-pge-ce-frontend
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

### Executando o Projeto

#### Desenvolvimento (Frontend + Backend Mock)

Para iniciar o ambiente de desenvolvimento completo (Angular + JSON Server):

```bash
npm run start:dev
```

Este comando irá:
- Iniciar o servidor Angular em `http://localhost:4200`
- Iniciar o JSON Server (API Mock) em `http://localhost:3000`
- Configurar o proxy automaticamente para redirecionar requisições `/api/*` para o JSON Server

**Acesse a aplicação em:** [http://localhost:4200](http://localhost:4200)

#### Executando Serviços Separadamente

Se preferir executar os serviços em terminais separados:

**Terminal 1 - Frontend:**
```bash
npm run start
```

**Terminal 2 - Backend Mock:**
```bash
npm run start:json
```

### Executando Testes 

#### Testes Unitários (Karma & Jasmine)

**Executar testes com cobertura de código (padrão):**
```bash
npm run test
```

Este comando irá:
- Executar todos os testes unitários
- Gerar relatório de cobertura de código
- Abrir automaticamente o browser do Karma/Jasmine em `http://localhost:9876` para visualização interativa dos resultados

**Em modo watch (re-executa testes ao alterar arquivos):**
```bash
npm run test:watch
```

**Visualizar relatório de cobertura HTML:**

Após executar os testes, um relatório HTML detalhado de cobertura é gerado na pasta `coverage/teste-pge/`. Para visualizá-lo:

1. **Abrir diretamente no navegador:**
   - Navegue até a pasta do projeto e abra: `coverage/teste-pge/index.html`
   - *Nota:* O caminho completo dependerá de onde você clonou o projeto (exemplo: se clonou em `C:\Projetos\teste-pge`, o caminho será `C:\Projetos\teste-pge\coverage\teste-pge\index.html`)
   - Clique duas vezes no arquivo `index.html` para abrir no navegador padrão

2. **Via terminal (Windows PowerShell):**
   ```powershell
   start coverage/teste-pge/index.html
   ```
   Ou:
   ```powershell
   Invoke-Item coverage/teste-pge/index.html
   ```

3. **Via terminal (Git Bash):**
   ```bash
   start coverage/teste-pge/index.html
   ```

O relatório HTML mostra:
- **Visão geral:** Percentuais de cobertura (Statements, Branches, Functions, Lines)
- **Detalhes por arquivo:** Linhas cobertas (verde), parcialmente cobertas (amarelo) e não cobertas (vermelho)
- **Branches não testados:** Caminhos condicionais que não foram executados

#### Testes E2E (Cypress)

**⚠️ Importante:** Antes de executar os testes E2E, certifique-se de que a aplicação está rodando (`npm run start:dev`).

**💡 Recomendação:** Use o browser padrão do Cypress (Electron) ao invés do Chrome. O Electron não exibe os popups de aviso de senha insegura do Chrome, tornando os testes mais limpos e sem interrupções.

**Interface interativa (recomendado - usa Electron por padrão):**
```bash
npm run e2e
```

**Interface interativa com Chrome (se preferir):**
```bash
npm run e2e:chrome
```

**Execução headless (sem interface, para CI/CD):**
```bash
npm run e2e:headless
```

**Execução headless com Chrome:**
```bash
npm run e2e:headless:chrome
```

### Build para Produção

```bash
npm run build:prod
```

Os arquivos compilados estarão na pasta `dist/teste-pge/`.

---

## 🐳 Docker (Principal)

O projeto inclui uma configuração completa do Docker Compose que permite executar todo o ambiente de desenvolvimento e testes dentro de containers Docker. Dessa forma evitando qualquer problema relacionado a maquina desde que se tenha o docker corretamente instalado.

### Por que usar Docker?

- **Consistência:** Ambiente idêntico para todos os desenvolvedores
- **Isolamento:** Não interfere com instalações locais
- **Visualização completa:** Browsers funcionando via VNC (Cypress) e interface web (Karma)

### Início Rápido
- App + JSON Server (aplicação):
```bash
./docker/scripts.sh up
# Angular: http://localhost:4200
# JSON Server (app): http://localhost:3000
```

- Karma headless + coverage:
```bash
./docker/scripts.sh test
```
Relatório: `coverage/teste-pge/index.html` Abrindo em sua maquina.
```bash
open coverage/teste-pge/index.html  # macOS
xdg-open coverage/teste-pge/index.html  # Linux
start coverage/teste-pge/index.html  # Windows
```  

- Karma remoto (browser local):
```bash
./docker/scripts.sh test:remote
```
Abra `http://localhost:9876` e clique em **Debug**.

- Cypress com browser via VNC (tudo no Docker):
```bash
./docker/scripts.sh cypress
```
Abra `http://localhost:6080/vnc.html` (senha: `cypress`), escolha o browser (Chrome) e rode os specs.

- Cypress com browser local (opcional):
```bash
docker-compose --profile tests up angular-cypress json-server-cypress
CYPRESS_baseUrl=http://localhost:4201 npx cypress open
```

### Documentação Completa

- **Guia rápido:** [docker/QUICKSTART.md](./docker/QUICKSTART.md)
- **Documentação completa:** [docker/README.md](./docker/README.md)

---

## 📝 Pré-condições para Execução Local (sem Docker)

- Node.js 18+ instalado
- Electron (vem com Cypress) - Recomendado para evitar avisos de senha insegura durante os testes E2E
- Portas 4200 (Angular) e 3000 (JSON Server) disponíveis
