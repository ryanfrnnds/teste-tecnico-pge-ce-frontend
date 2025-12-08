# 🚀 Quick Start - Docker

## Início Rápido

### 1. Iniciar desenvolvimento
```bash
# Linux/Mac
./docker/scripts.sh up

# Windows
docker\scripts.bat up
```

Acesse:
- **Angular**: http://localhost:4200
- **JSON Server**: http://localhost:3000

### 2. Testes Karma
- Headless + coverage:
```bash
./docker/scripts.sh test
```
Relatório: `coverage/teste-pge/index.html`.

- Remoto (browser local via capture):
```bash
./docker/scripts.sh test:remote
```
Abra `http://localhost:9876` e clique em **Debug**.

### 3. Testes Cypress (via Docker)
- Browser via VNC (tudo no Docker):
```bash
./docker/scripts.sh cypress
```
Acesse **http://localhost:6080/vnc.html** (senha: `cypress`), escolha o browser (Chrome) e rode os specs.

- Browser local (opcional):
```bash
docker-compose --profile tests up angular-cypress json-server-cypress
CYPRESS_baseUrl=http://localhost:4201 npx cypress open
```

### 4. Parar tudo
```bash
# Linux/Mac
./docker/scripts.sh down

# Windows
docker\scripts.bat down
```

## 📚 Mais informações

Veja [docker/README.md](./README.md) para documentação completa.

