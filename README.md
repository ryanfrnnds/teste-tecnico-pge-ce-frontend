
# Projeto Teste PGE

Este repositório contém o projeto base para implementação do teste técnico solicitado.
O objetivo é oferecer um ambiente totalmente funcional e padronizado, executável sem instalações locais de Node ou Angular — **apenas Docker**.

---

## 📑 Índice

- [⚡ Quick Start](#-quick-start)
- [🚀 Objetivos do Projeto](#-objetivos-do-projeto)
- [🚧 Status do Projeto](#-status-do-projeto)
- [📋 Funcionalidades Implementadas](FUNCIONALIDADES.md)
- [📄 Referências (PDF)](#-referências)
- [🧱 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [🔥 Como Iniciar (Desenvolvimento)](#-ambiente-de-desenvolvimento-hot-reload-via-docker)
- [🌐 Acessando a Aplicação](#-acessando-a-aplicação-no-browser)
- [🛠️ Scripts Facilitadores](#scripts-facilitadores-atalhos)
- [🏭 Produção / Build](#-ambiente-de-produção--build)
- [🧩 Sobre o PrimeFlex](#-sobre-a-escolha-do-primeflex-importante)
- [🐳 Por que Docker?](#-por-que-usar-docker)
- [🌐 Proxy & CORS](#-proxy-de-desenvolvimento-cors-resolvido-no-angular)
- [⚠️ Persistência de Dados](#persistência-de-dados-importante)
- [📂 Estrutura de Arquivos](#-estrutura-do-projeto)
- [🔄 CI/CD & Versionamento](#-cicd--versionamento)
- [🏛️ Arquitetura & Decisões](#arquitetura--decisões-técnicas)
- [🧪 Estratégia de Testes](#-estratégia-de-testes)

---

## Projeto Teste PGE (Frontend Angular)

Este repositório implementa o teste prático da **PGE-CE** usando Angular 19, PrimeNG e Docker, com foco em um ambiente 100% reproduzível para o avaliador.

---

## 📑 Índice

- [⚡ Quick Start (Docker)](#-quick-start-docker)
- [📄 Sobre o Desafio](#-sobre-o-desafio)
- [🚧 Status Geral do Projeto](#-status-geral-do-projeto)
- [📊 Resumo Requisitos x Implementação](#-resumo-requisitos-x-implementação)
- [📚 Documentação Detalhada](#-documentação-detalhada)

---

## ⚡ Quick Start (Docker)

```bash
# Windows
./scripts/powershell/start.ps1

# Linux/Mac/Bash/GitBash
./scripts/bash/start.sh
```

**Acessar no browser:**
- 🌐 **Aplicação:** http://localhost:4200
- 🔌 **API Mock:** http://localhost:3000

**Para executar testes:**

```bash
# Windows
./scripts/powershell/test.ps1

# Linux/Mac/Bash/GitBash
./scripts/bash/test.sh
```

---

## 📄 Sobre o Desafio

O projeto implementa o **Teste Prático - Desenvolvedor Front-End - Procuradoria Geral do Estado do Ceará**, cujo enunciado completo está disponível em PDF:

- [📕 Especificação do Teste (PDF)](referencias/Teste%20Pr%C3%A1tico%20-%20Desenvolvedor%20-%20Front-End%20-%20Procuradoria%20Geral%20do%20Estado%20do%20Cear%C3%A1.pdf)

Escopo principal:

- Tela de **listagem de clientes** com filtros e preservação de estado.
- Formulário reativo de cliente com **máscaras e validações**.
- Integração com API (mock) e **logs de auditoria**.
- Feedback ao usuário com **toasts**.
- Testes automatizados.

---

## 🚧 Status Geral do Projeto

> **EM CONSTRUÇÃO** – funcionalidades estão sendo entregues de forma incremental, priorizando a tela de listagem de clientes e a infraestrutura em torno dela (logs, loading, testes, Docker).

Implementado até o momento (visão macro):

- Listagem de clientes com filtros avançados, cards mobile e tabela desktop.
- Logs de operações (json-server + tela de visualização).
- Decorator de log (`@LogOperation`) e interceptor de loading global.
- Ambiente Docker completo (dev, testes e build).
- Testes unitários para serviços e tela de listagem.

Pendente / em evolução:

- Formulário reativo completo de cliente (cadastro/edição).
- Testes E2E e testes específicos de formulário.

---

## 📊 Resumo Requisitos x Implementação

Resumo condensado do comparativo detalhado entre o PDF do desafio e o estado atual do projeto:

| Seção do PDF | Tópico                                    | Status atual                                |
|--------------|-------------------------------------------|---------------------------------------------|
| 1            | Formulário reativo + máscaras + diretiva  | ❌ Formulário / ✅ Diretivas (formatação)   |
| 2            | Listagem + filtros + estado               | ✅ Implementado (lista + filtros + estado)  |
| 3            | Modal de confirmação reutilizável         | ✅ Implementado                             |
| 4            | Integração HTTP + Interceptors + feedback | ✅ Implementado                             |
| 5            | Observabilidade (logs + toasts)           | ✅ Implementado                             |
| 6            | Testes automatizados                      | ✅ Lista/Services / ❌ Formulário/E2E       |

> O comparativo completo e sempre atualizado está em  
> `documentacao/COMPARATIVO_REQUISITOS.md`.

---

## 📚 Documentação Detalhada

Para não poluir o `README` com muitos detalhes de implementação, a documentação foi organizada na pasta `documentacao/`:

- **[documentacao/AMBIENTE_E_EXECUCAO.md](documentacao/AMBIENTE_E_EXECUCAO.md)**  
  Detalhes de ambientes (dev/test/prod), Docker, scripts, proxy e persistência.

- **[documentacao/ARQUITETURA_DECISOES.md](documentacao/ARQUITETURA_DECISOES.md)**  
  Arquitetura, estrutura de pastas (`core`/`pages`), loading global, decorator de logs, Docker-first.

- **[documentacao/ESTRATEGIA_TESTES.md](documentacao/ESTRATEGIA_TESTES.md)**  
  Estratégia de testes, cenário atual e próximos passos.

- **[documentacao/FUNCIONALIDADES.md](documentacao/FUNCIONALIDADES.md)**  
  Funcionalidades já implementadas (lista de clientes, infra, temas, etc.).

- **[documentacao/COMPARATIVO_REQUISITOS.md](documentacao/COMPARATIVO_REQUISITOS.md)**  
  Comparativo detalhado requisito a requisito entre o PDF e a implementação atual.

---

## 🧱 Tecnologias Utilizadas (Resumo)

- **Angular 19** (Standalone Components)
- **PrimeNG 19** + **PrimeFlex 4** + **PrimeIcons**
- **json-server** para API mock
- **Docker & Docker Compose** (Node 22, Nginx para build de produção)
- **Jasmine + Karma** (testes unitários)

### 1. Path Aliases (@)
Configuramos o `tsconfig.json` para utilizar atalhos de importação (`@models`, `@services`, `@shared`).
*   **Motivo:** Elimina imports relativos longos (`../../../models`) e facilita refatorações, tornando o código mais legível.

### 2. Estrutura de Pastas (Core & Pages)
Adotamos uma estrutura que separa claramente responsabilidades globais de responsabilidades de apresentação:

*   **`src/app/core/`**: Contém singletons, serviços globais, modelos de domínio compartilhados e interceptores. É o coração da aplicação.
    *   *Exemplo:* `ClienteService` (comunicação com API), `LoggerService`, `LoadingService`, `LogOperation` (Decorator), `LoadingInterceptor`.
*   **`src/app/pages/`**: Contém os componentes de página (roteáveis). Cada subpasta representa uma feature/tela do sistema.
    *   *Exemplo:* `clientes/lista-clientes` (Componente de apresentação).

### 3. Loading Global Inteligente
Implementamos um sistema de loading global que gerencia automaticamente o estado de carregamento:

*   **`LoadingService`**: Serviço singleton que controla o estado global de loading através de BehaviorSubjects.
*   **`LoadingInterceptor`**: Interceptor HTTP que empilha requisições automaticamente, ativando/desativando loading conforme necessário.
*   **Empilhamento Inteligente**: Gerencia múltiplas requisições simultâneas, só desativando loading quando todas terminarem.
*   **Performance Otimizada**: Só controla loading para requisições `/api`, evitando interferência com assets estáticos.

*   **Decisão:** Essa separação evita acoplamento e deixa claro onde cada tipo de código deve residir. "Se é lógica de negócio/API, vai no Core. Se é tela, vai em Pages".

### 3. Logs via Decorator (AOP)
A implementação de logs utiliza o padrão **Decorator** (`@LogOperation`).
*   **Motivo:** Remove a responsabilidade de logar de dentro da lógica de negócio do Service. Aplicamos o princípio de **Programação Orientada a Aspectos (AOP)**, onde o log é um *cross-cutting concern*.
*   **Benefício:** O código do CRUD permanece limpo, focado apenas na chamada HTTP.

### 4. Docker-First
A aplicação foi desenhada para rodar nativamente em Docker.
*   **Motivo:** Garantir que o revisor tenha exatamente o mesmo ambiente de execução do desenvolvedor, eliminando problemas de "funciona na minha máquina" relacionados a versões de Node/OS.

### 5. Execução de Testes em Container
Para viabilizar a execução dos testes unitários dentro do Docker, foram necessárias duas adaptações específicas no `karma.conf.js`:

1.  **ChromeHeadlessNoSandbox**: Criação de um *Custom Launcher* que adiciona a flag `--no-sandbox`. Isso é obrigatório para rodar o Chrome (Chromium) dentro de um container Alpine Linux como usuário root.
2.  **Karma Spec Reporter**: Adição do plugin `karma-spec-reporter` para melhorar a visualização dos testes no console, já que o reporter padrão do Karma é minimalista demais para ambientes de CI/terminal.

---

# 🚀 Objetivos do Projeto

Este projeto serve como base para a futura implementação de:

- Formulário completo de cadastro de cliente  
- Máscaras, validações e comportamento dinâmico (Reactive Forms)  
- Listagem com filtros e paginação  
- Preservação de estado  
- Componentização (ex.: modal reutilizável)  
- Comunicação com API mock via json-server  
- Observabilidade e feedback ao usuário (Toast / Logs)  
- Testes unitários  

Por enquanto, este projeto contém **apenas a infraestrutura**, sem implementar ainda as funcionalidades do teste.

---

# 🧱 Tecnologias Utilizadas

- **Angular 19**
- **PrimeNG 19**
- **PrimeFlex 4**
- **PrimeIcons**
- **json-server**
- **Docker & Docker Compose**
  - Node 22 (via container)
  - Nginx 1.27 (via container - produção)
- **Node + NVM** (uso opcional - apenas se preferir rodar localmente sem Docker)

---

# 🧩 Sobre a escolha do PrimeFlex (IMPORTANTE)

O projeto usa **PrimeFlex 4** apenas porque se trata de um **teste técnico** e a prioridade é fornecer:

- agilidade no desenvolvimento do layout;
- integração natural com o ecossistema PrimeNG;
- responsividade rápida sem boilerplate ou CSS excessivo.

No entanto, é essencial reforçar:

## ❗ PrimeFlex está oficialmente em processo de "sunset"

A própria PrimeTek anunciou publicamente que o PrimeFlex **não será mais foco de desenvolvimento**, e que a recomendação para novos projetos é utilizar **Tailwind CSS**.

🔗 **Fonte oficial:**  
https://primeflex.org  
Mensagem oficial: _“PrimeFlex is being sunset.”_

### ✔ Conclusão sobre o uso do PrimeFlex
O PrimeFlex é utilizado **somente para este teste**.  
Em projetos reais, corporativos e de longo prazo, a recomendação seria:

- Tailwind CSS (preferência da própria PrimeTek)
- Outro framework utility-first moderno

---

# 🐳 Por que usar Docker?

Este projeto foi estruturado para que **nenhuma instalação local seja necessária**, exceto o Docker.

### Benefícios:

- Ambiente isolado e padronizado entre revisores e desenvolvedores  
- Elimina diferenças de versões de Node, Angular CLI, libs globais etc.  
- Hot Reload funcionando dentro do Docker  
- Aproximação natural de ambientes reais de CI/CD  
- Simplicidade: apenas `docker compose up`  

---

# 📂 Estrutura do Projeto

```
teste-pge/
├── src/
│   ├── app/
│   │   ├── core/          # Lógica Central (Services, Models, Decorators)
│   │   │   ├── decorators/
│   │   │   ├── models/
│   │   │   └── services/
│   │   │
│   │   ├── pages/         # Páginas / Telas (Componentes Visuais)
│   │   │   └── clientes/
│   │   │       └── lista-clientes/
│   │   │
│   │   ├── app.routes.ts
│   │   └── ...
│   │
│   └── assets/
│
├── json-server/
│   ├── db.json
│   └── ...
│
├── nginx/
├── scripts/               # Atalhos (start.ps1, etc)
├── Dockerfile
├── docker-compose.dev.yml
└── README.md
```

---

# 🔄 CI/CD & Versionamento

O projeto conta com um pipeline automatizado via **GitHub Actions** configurado para a branch `dev`.

### Estratégia de Tags (Simulação)
Como estamos simulando um ambiente de desenvolvimento contínuo, adotamos a seguinte estratégia para controle de histórico:

1.  **Branch Principal:** `dev`
2.  **Automação:** A cada **push** na branch `dev`, o workflow:
    *   Calcula a próxima versão baseada na última tag (SemVer).
    *   Incrementa o *Patch Version*.
    *   Adiciona o sufixo `-SNAPSHOT`.
    *   Gera uma **Tag Git** automaticamente (ex: `v0.0.4-SNAPSHOT`).

> ℹ️ **Nota:** Em um cenário real corporativo, este fluxo seria complementado por Pull Requests, Code Reviews e branches estáveis (`main`/`master`) gerando versões de release sem o sufixo snapshot. Aqui, o foco é demonstrar a automação e organização do histórico.

---

# 🌐 Proxy de Desenvolvimento (CORS resolvido no Angular)

Durante o desenvolvimento:

- Angular dev server → `http://localhost:4200`
- json-server → `http://localhost:3000`

Isso naturalmente criaria problemas de CORS no navegador.

Em sistemas reais, isso poderia ser resolvido de várias formas:

- configurar CORS no backend real  
- colocar tudo atrás de Nginx  
- usar API Gateway / BFF  
- usar proxies reversos dedicados  

Mas como este projeto lida apenas com **frontend + API mock**, usamos a solução mais simples e nativa:

## ✔ Proxy de desenvolvimento do Angular

Arquivo: `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://json-server:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  }
}
```

Com isso:

- O Angular recebe as requisições via `http://localhost:4200/api/...`
- Ele repassa internamente para `http://json-server:3000`
- Zero problemas de CORS  
- Zero necessidade de configurar o json-server

> Esta escolha é **apenas para o teste**.  
> Em aplicações reais, a estratégia de proxy/CORS dependeria da arquitetura adotada.

---

# Persistência de Dados (Importante) ⚠️

O projeto utiliza **dois bancos de dados json-server separados**:

### 1. Ambiente de Desenvolvimento (`db.json`)
- **Arquivo:** `json-server/db.json`
- **Uso:** Container `frontend-dev` e `json-server`
- **Persistência:** Sem volumes persistentes - dados resetam ao reiniciar

### 2. Ambiente de Testes (`db.test.json`)
- **Arquivo:** `json-server/db.test.json`  
- **Uso:** Container `frontend-test` e `json-server-test`
- **Persistência:** Sem volumes persistentes - dados resetam ao reiniciar
- **Isolamento:** Totalmente independente do ambiente de desenvolvimento


---

# 🔥 Ambiente de Desenvolvimento (Hot Reload via Docker)

Este é o modo **recomendado**.

### Scripts Facilitadores (Atalhos)

Para agilizar o uso, foram criados scripts na pasta `scripts/` (separados por ambiente) que abstraem os comandos longos do Docker.

| Ação | Windows (PowerShell) | Linux / Mac (Bash) | O que faz? |
|------|----------------------|--------------------|------------|
| **Iniciar** | `./scripts/powershell/start.ps1` | `./scripts/bash/start.sh` | Sobe o ambiente de desenvolvimento (`docker-compose.dev.yml`) |
| **Parar** | `./scripts/powershell/stop.ps1` | `./scripts/bash/stop.sh` | Para os containers de desenvolvimento |
| **Atualizar** | `./scripts/powershell/update.ps1` | `./scripts/bash/update.sh` | Reconstroi as imagens (`up --build`) |
| **Limpeza Total** | `./scripts/powershell/full-remove.ps1` | `./scripts/bash/full-remove.sh` | **Cuidado:** Remove containers, imagens e volumes (cache de dependências) |
| **Testar** | `./scripts/powershell/test.ps1` | `./scripts/bash/test.sh` | Sobe ambiente de testes isolado por 10 minutos (modo watch) |

> **💡 Execução Paralela:** Os scripts de **teste** e **desenvolvimento** podem rodar simultaneamente! O ambiente de testes utiliza:
>   - Containers completamente separados (`docker-compose.test.yml`)
>   - Banco de dados dedicado (`db.test.json`)
>   - Modo watch (auto-reload) por 10 minutos

> **Nota Linux/Mac:** Pode ser necessário dar permissão de execução: `chmod +x scripts/bash/*.sh`

### 📌 Execução Manual (sem scripts)

Se preferir rodar manualmente:

```bash
docker compose -f docker-compose.dev.yml up --build
```

---

## 🌐 Acessando a Aplicação no Browser

Após executar o script de **start** (desenvolvimento), a aplicação estará disponível nos seguintes endereços:

### Frontend Angular (Aplicação Principal)

```
http://localhost:4200
```

**O que você encontrará:**
- Interface da aplicação Angular com PrimeNG
- Hot Reload ativo (mudanças no código refletem automaticamente)
- Proxy configurado para comunicação com a API

### API Mock (json-server)

```
http://localhost:3000
```

**Endpoints disponíveis:**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `http://localhost:3000/clientes` | GET | Lista todos os clientes |
| `http://localhost:3000/clientes/{id}` | GET | Busca cliente por ID |
| `http://localhost:3000/clientes` | POST | Cria novo cliente |
| `http://localhost:3000/clientes/{id}` | PUT | Atualiza cliente |
| `http://localhost:3000/clientes/{id}` | DELETE | Remove cliente |
| `http://localhost:3000/logs` | GET | Lista logs de operações |

> **💡 Dica:** Você pode acessar `http://localhost:3000` diretamente no browser para ver a interface do json-server com todos os recursos disponíveis.

### 🔄 Hot Reload:

Funciona normalmente porque os arquivos locais são montados como volume no container.

---

### ⚠️ Importante: Ambiente de Testes vs Desenvolvimento

**Ambiente de Desenvolvimento** (`start.sh/ps1`):
- ✅ Expõe portas 4200 e 3000
- ✅ Acessível via browser
- ✅ Hot reload do Angular
- 🎯 Uso: Desenvolvimento e visualização da aplicação

**Ambiente de Testes** (`test.sh/ps1`):
- ✅ Expõe porta 9876 (interface do Karma)
- ✅ Acessível via http://localhost:9876
- ✅ Modo watch do Karma (10 minutos)
- ❌ NÃO expõe aplicação (apenas testes)
- 🎯 Uso: Execução e monitoramento de testes unitários

> **💡 Para acessar a aplicação Angular, use `start`. Para acompanhar os testes visualmente, use `test` e acesse http://localhost:9876.**

---

# 🏭 Ambiente de Produção / Build

Para rodar uma simulação do ambiente de produção:

```bash
docker compose up --build
```

Isso criará o build otimizado do Angular e servirá os arquivos estáticos.

### Sobre o Servidor Web
Atualmente, o projeto utiliza **Nginx** (via Docker) como servidor web de referência para entregar os arquivos estáticos do frontend.

No entanto, a escolha final da tecnologia de servidor web depende da infraestrutura da organização. Alternativas comuns incluem:
- **Apache HTTP Server**
- **IIS (Internet Information Services)**
- **Caddy**
- **Cloud Storage + CDN** (ex: AWS S3 + CloudFront, Azure Blob Storage)
- **Kubernetes Ingress**

O arquivo `nginx/default.conf` incluído serve apenas como **sugestão de configuração** para o contexto deste teste e contêineres Docker.

---

# 🧑‍💻 Execução LOCAL sem Docker (opcional)

Somente se desejar usar Node localmente.

### Requisitos:

- Node 20+  
- Recomenda-se usar NVM:

```bash
nvm install 20
nvm use 20
```

### Instalar dependências:

```bash
npm install
```

### Subir frontend + API mock:

```bash
npm run start:dev:local
```

---

# 🚧 Status do Projeto

> **EM CONSTRUÇÃO** - Desenvolvimento em progresso. 🔨

As funcionalidades do teste estão sendo implementadas.

---

# 📄 Referências

Para consultar os requisitos completos do teste, acesse o arquivo PDF incluso no projeto:

[📕 Teste Prático - Especificações (PDF)](<referencias/Teste Prático - Desenvolvedor - Front-End - Procuradoria Geral do Estado do Ceará.pdf>)

---

# 📋 Funcionalidades Implementadas

Para detalhes completos sobre as funcionalidades implementadas, arquitetura e decisões técnicas, consulte o documento dedicado:

📖 **[FUNCIONALIDADES.md](FUNCIONALIDADES.md)** - Documentação detalhada das funcionalidades, arquitetura e implementação

---

# 🧪 Estratégia de Testes

O projeto adota uma abordagem de testes automatizados focada na confiabilidade dos fluxos principais.

### ✅ Testes Implementados (Jasmine + Karma)

| Camada | Arquivo | O que é testado? |
|--------|---------|------------------|
| **Core / Service** | `core/services/cliente.service.spec.ts` | Validação completa do CRUD, verificação de URLs, métodos HTTP (GET/POST/PUT/DELETE) e integração com o sistema de Logs. |
| **Pages / Component** | `pages/clientes/lista-clientes/lista-clientes.component.spec.ts` | **✅ COMPLETA** - Validação abrangente do componente de listagem: carregamento inicial, filtros avançados (busca múltipla + status), paginação com estado preservado, exclusão com modal de confirmação, navegação com query params, métodos utilitários (formatação CPF/telefone/status) e tratamento robusto de erros. |
| **Decorator** | (Via Service) | O teste do Service valida indiretamente se o decorator `@LogOperation` está interceptando as chamadas e registrando os logs corretamente no `LoggerService`. |

### 🎯 Próximos Testes (Planejados)

*   **Componente de Formulário:** Validar estados do Reactive Forms (invalid/valid), máscaras de entrada e mensagens de erro.
*   **Integração E2E:** Testes end-to-end com Cypress para fluxos completos de usuário (cadastro → listagem → edição → exclusão).

> **Para rodar os testes via Docker (Recomendado):**
> ```bash
> ./scripts/powershell/test.ps1  # Windows
> ./scripts/bash/test.sh         # Linux/Mac
> ```
> **Comportamento:** O script sobe um ambiente isolado de testes que:
> - Usa banco de dados separado (`db.test.json`)
> - Roda em modo watch (auto-reload ao modificar arquivos)
> - Permanece ativo por **10 minutos**
> - **Expõe interface do Karma em http://localhost:9876**
> - Pode ser encerrado antes com `Ctrl+C`
>
> **🎯 Acesse http://localhost:9876 no browser para:**
> - Visualizar testes rodando em tempo real
> - Ver resultados detalhados de cada spec
> - Debugar testes clicando em "Debug"
>
> **Ou manualmente com Node local:**
> ```bash
> npm test
> ```
>
> **💡 Execução Paralela:** Você pode deixar o ambiente de desenvolvimento rodando (`start.sh/ps1`) e executar os testes simultaneamente em outro terminal — os ambientes são completamente isolados (containers separados + bancos de dados diferentes)!

---

# ✔ Conclusão

Este projeto entrega:

- Ambiente Angular completo  
- PrimeNG + PrimeFlex configurados  
- API mock dockerizada  
- Proxy Angular para evitar CORS  
- Docker para dev e produção  
- Hot reload funcional  
- Estrutura organizada e limpa para iniciar o teste  

Totalmente pronto para desenvolvimento — basta abrir no editor e iniciar!

