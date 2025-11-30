
# Projeto Teste PGE

Este repositório contém o projeto base para implementação do teste técnico solicitado.
O objetivo é oferecer um ambiente totalmente funcional e padronizado, executável sem instalações locais de Node ou Angular — **apenas Docker**.

---

## 📑 Índice

- [⚡ Quick Start](#-quick-start)
- [🚀 Objetivos do Projeto](#-objetivos-do-projeto)
- [🚧 Status do Projeto](#-status-do-projeto)
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

## ⚡ Quick Start

**Para executar o projeto:**

```bash
# Windows
./scripts/powershell/start.ps1

# Linux/Mac
./scripts/bash/start.sh
```

**Acessar no browser:**
- 🌐 **Aplicação:** http://localhost:4200
- 🔌 **API Mock:** http://localhost:3000

**Para executar testes:**

```bash
# Windows
./scripts/powershell/test.ps1

# Linux/Mac
./scripts/bash/test.sh
```

**Acompanhar testes no browser:**
- 🧪 **Interface do Karma:** http://localhost:9876

> **Nota:** A interface do Karma fica disponível por 10 minutos durante a execução dos testes.

---

# 🏛️ Arquitetura & Decisões Técnicas

Este projeto segue princípios de **Clean Code** e boas práticas do ecossistema Angular, adaptados para o escopo de um teste técnico. Abaixo, as principais decisões arquiteturais:

### 1. Path Aliases (@)
Configuramos o `tsconfig.json` para utilizar atalhos de importação (`@models`, `@services`, `@shared`).
*   **Motivo:** Elimina imports relativos longos (`../../../models`) e facilita refatorações, tornando o código mais legível.

### 2. Estrutura de Pastas (Core & Pages)
Adotamos uma estrutura que separa claramente responsabilidades globais de responsabilidades de apresentação:

*   **`src/app/core/`**: Contém singletons, serviços globais, modelos de domínio compartilhados e interceptadores. É o coração da aplicação.
    *   *Exemplo:* `ClienteService` (comunicação com API), `LoggerService`, `LogOperation` (Decorator).
*   **`src/app/pages/`**: Contém os componentes de página (roteáveis). Cada subpasta representa uma feature/tela do sistema.
    *   *Exemplo:* `clientes/lista-clientes` (Componente de apresentação).

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

# 🧪 Estratégia de Testes

O projeto adota uma abordagem de testes automatizados focada na confiabilidade dos fluxos principais.

### ✅ Testes Implementados (Jasmine + Karma)

| Camada | Arquivo | O que é testado? |
|--------|---------|------------------|
| **Core / Service** | `core/services/cliente.service.spec.ts` | Validação completa do CRUD, verificação de URLs, métodos HTTP (GET/POST/PUT/DELETE) e integração com o sistema de Logs. |
| **Decorator** | (Via Service) | O teste do Service valida indiretamente se o decorator `@LogOperation` está interceptando as chamadas e registrando os logs corretamente no `LoggerService`. |

### 🎯 Próximos Testes (Planejados)

*   **Componente de Listagem:** Validar renderização da tabela PrimeNG e comportamento de filtros.
*   **Componente de Formulário:** Validar estados do Reactive Forms (invalid/valid) e mensagens de erro.

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

