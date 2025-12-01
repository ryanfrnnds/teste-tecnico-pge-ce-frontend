## ⚙️ Ambiente, Execução & Scripts

Este documento centraliza detalhes de execução do projeto, ambientes Docker e scripts utilitários.

### 1. Quick Start (Docker)

**Para executar o projeto:**

```bash
# Windows
./scripts/powershell/start.ps1

# Linux/Mac/Bash/ GitBash
./scripts/bash/start.sh
```

**Acessos principais:**

- Aplicação: `http://localhost:4200`
- API Mock (json-server): `http://localhost:3000`

**Para executar testes:**

```bash
# Windows
./scripts/powershell/test.ps1

# Linux/Mac/Bash/ GitBash
./scripts/bash/test.sh
```

Interface do Karma: `http://localhost:9876` (ativa por 10 minutos).

### 2. Scripts Facilitadores

| Ação                | Windows (PowerShell)           | Linux / Mac (Bash)            | O que faz?                                                         |
|---------------------|--------------------------------|-------------------------------|--------------------------------------------------------------------|
| **Iniciar**         | `./scripts/powershell/start.ps1` | `./scripts/bash/start.sh`   | Sobe o ambiente de desenvolvimento (`docker-compose.dev.yml`)     |
| **Parar**           | `./scripts/powershell/stop.ps1`  | `./scripts/bash/stop.sh`    | Para os containers de desenvolvimento                             |
| **Atualizar**       | `./scripts/powershell/update.ps1`| `./scripts/bash/update.sh`  | Reconstrói as imagens (`up --build`)                              |
| **Limpeza Total**   | `./scripts/powershell/full-remove.ps1` | `./scripts/bash/full-remove.sh` | Remove containers, imagens e volumes (cache de dependências) |
| **Testar**          | `./scripts/powershell/test.ps1` | `./scripts/bash/test.sh`    | Sobe ambiente de testes isolado (modo watch, 10 minutos)          |

### 3. Ambientes

#### Desenvolvimento (`start.sh/ps1`)

- Expõe portas 4200 (frontend) e 3000 (API mock).
- Hot reload do Angular.
- Uso principal: desenvolvimento e visualização da aplicação.

#### Testes (`test.sh/ps1`)

- Expõe porta 9876 (interface do Karma).
- Usa banco de dados separado (`db.test.json`).
- Modo watch por 10 minutos.

#### Produção / Build

```bash
docker compose up --build
```

- Gera build otimizado do Angular.
- Servido por Nginx em container (exemplo de ambiente de produção).

### 4. Proxy & CORS

- Angular dev server: `http://localhost:4200`
- json-server: `http://localhost:3000`

Usamos `proxy.conf.json` para mapear `/api` → `http://json-server:3000`, eliminando problemas de CORS durante o desenvolvimento.

### 5. Persistência de Dados

O projeto utiliza bancos `json-server` **não persistentes**:

- `db.json` para desenvolvimento.
- `db.test.json` para testes.

Os dados são resetados sempre que os containers são recriados, garantindo ambiente limpo a cada execução.


