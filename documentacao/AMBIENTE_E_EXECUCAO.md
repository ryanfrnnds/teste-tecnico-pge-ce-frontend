## ⚙️ Ambiente, Execução & Scripts

Este documento centraliza detalhes de execução do projeto, ambientes Docker e scripts utilitários.

### 1. Quick Start (Docker)

**Para executar o projeto (desenvolvimento):**

```bash
# Windows
./scripts/powershell/start.ps1

# Linux/Mac/Bash/ GitBash
./scripts/bash/start.sh
```

**Acessos principais (dev):**

- Aplicação: `http://localhost:4200`
- API Mock (json-server): `http://localhost:3000`

**Para executar testes unitários (modo watch, via Karma):**

```bash
# Windows
./scripts/powershell/test.ps1

# Linux/Mac/Bash/ GitBash
./scripts/bash/test.sh
```

Interface do Karma: `http://localhost:9876` (ativa por 10 minutos).

**Para executar testes unitários (execução única em Docker):**

```bash
# Windows
./scripts/powershell/test-unit.ps1

# Linux/Mac/Bash/ GitBash
./scripts/bash/test-unit.sh
```

**Para executar testes E2E (Cypress em Docker):**

```bash
# Windows
./scripts/powershell/test-e2e.ps1

# Linux/Mac/Bash/ GitBash
./scripts/bash/test-e2e.sh
```

Durante a execução dos testes E2E a aplicação fica acessível em `http://localhost:4200`.

### 2. Scripts Facilitadores

| Ação                          | Windows (PowerShell)                   | Linux / Mac (Bash)              | O que faz?                                                                |
|-------------------------------|----------------------------------------|---------------------------------|---------------------------------------------------------------------------|
| **Iniciar (dev)**            | `./scripts/powershell/start.ps1`      | `./scripts/bash/start.sh`      | Sobe o ambiente de desenvolvimento (`docker-compose.dev.yml`)            |
| **Parar (dev)**              | `./scripts/powershell/stop.ps1`       | `./scripts/bash/stop.sh`       | Para os containers de desenvolvimento                                    |
| **Atualizar (dev)**          | `./scripts/powershell/update.ps1`     | `./scripts/bash/update.sh`     | Reconstrói as imagens (`up --build`)                                     |
| **Limpeza Total**            | `./scripts/powershell/full-remove.ps1`| `./scripts/bash/full-remove.sh`| Remove containers, imagens e volumes (cache de dependências)             |
| **Testes unitários (watch)** | `./scripts/powershell/test.ps1`       | `./scripts/bash/test.sh`       | Sobe ambiente de testes isolado (modo watch, 10 minutos, Karma)          |
| **Testes unitários (único)** | `./scripts/powershell/test-unit.ps1`  | `./scripts/bash/test-unit.sh`  | Executa testes unitários uma única vez (`frontend-test` em Docker)       |
| **Testes E2E (Cypress)**     | `./scripts/powershell/test-e2e.ps1`   | `./scripts/bash/test-e2e.sh`   | Sobe ambiente E2E (`frontend-e2e` + `json-server-test-e2e` + `cypress`)  |

### 3. Ambientes

#### Desenvolvimento (`start.sh/ps1`)

- Expõe portas 4200 (frontend) e 3000 (API mock).
- Hot reload do Angular.
- Uso principal: desenvolvimento e visualização da aplicação.

#### Testes unitários (`test.sh/ps1`, `test-unit.sh/ps1`)

- `test.sh/ps1`:
  - Expõe porta 9876 (interface do Karma).
  - Usa banco de dados separado (`db.test.json`).
  - Modo watch por 10 minutos.
- `test-unit.sh/ps1`:
  - Executa os testes unitários uma única vez em container (`frontend-test`).
  - Usa `ChromeHeadlessNoSandbox` e `karma-spec-reporter`.

#### Testes E2E (`test-e2e.sh/ps1`)

- Sobe `frontend-e2e` (Angular) + `json-server-test-e2e` (API mock com `db.test.json`).
- Executa o serviço `cypress-e2e` com `npm run cypress:run`.
- A aplicação fica acessível em `http://localhost:4200` enquanto os testes rodam.

#### Produção / Build

```bash
docker compose up --build
```

- Gera build otimizado do Angular.
- Servido por Nginx em container (exemplo de ambiente de produção).

### 4. Proxy & CORS

- Angular dev server: `http://localhost:4200`
- json-server: `http://localhost:3000`

Usamos `proxy.conf.js` para mapear `/api` → `http://json-server:3000` (ou `http://localhost:3000` quando em dev local), eliminando problemas de CORS durante o desenvolvimento.

### 5. Persistência de Dados

O projeto utiliza bancos `json-server` **não persistentes**:

- `db.json` para desenvolvimento.
- `db.test.json` para testes.

Os dados são resetados sempre que os containers são recriados, garantindo ambiente limpo a cada execução.


