# Docker Setup - Teste PGE

Este projeto inclui uma configuração completa do Docker Compose para desenvolvimento e testes.

## 📋 Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose v2 (incluído no Docker Desktop)

## 🚀 Início Rápido

### 1. Iniciar serviços de desenvolvimento

```bash
# Usando scripts auxiliares (recomendado)
chmod +x docker/scripts.sh
./docker/scripts.sh up

# Ou usando docker-compose diretamente
docker-compose up -d angular json-server
```

Isso iniciará:
- **Angular Dev Server**: http://localhost:4200
- **JSON Server (API)**: http://localhost:3000

### 2. Parar serviços

```bash
./docker/scripts.sh down
# ou
docker-compose down
```

## 🧪 Testes

### Karma
- **Headless com coverage (logs no terminal)**
  ```bash
  ./docker/scripts.sh test
  ```
  Gera coverage em `coverage/teste-pge`. Para abrir o relatório:
  ```
  open coverage/teste-pge/index.html  # macOS
  xdg-open coverage/teste-pge/index.html  # Linux
  start coverage/teste-pge/index.html  # Windows
  ```

- **Remote/capture (browser local)**
  ```bash
  ./docker/scripts.sh test:remote
  ```
  Passos:
  1. Aguarde o log: `Karma vX.X.X server started` / `No captured browser`
  2. Abra `http://localhost:9876` no seu navegador local
  3. Clique em **Debug**. Os testes rodam no seu browser; logs ficam no terminal do container.

### Cypress

**Browser local (recomendado)**
1. Suba app + JSON Server dedicados para Cypress:
   ```bash
   docker-compose --profile tests up angular-cypress json-server-cypress
   ```
   - App: http://localhost:4201  
   - API mock: http://localhost:3002
2. Na sua máquina, rode:
   ```bash
   CYPRESS_baseUrl=http://localhost:4201 npx cypress open
   ```
   (ou `npm run cypress:open` com a mesma variável). Escolha o browser local e execute.

**Browser via VNC (no container)**
```bash
./docker/scripts.sh cypress
```
Abra `http://localhost:6080/vnc.html` para ver o browser. Aguarde alguns segundos após subir.

**Headless**
```bash
./docker/scripts.sh cypress:headless
```

## 📝 Scripts Disponíveis

O arquivo `docker/scripts.sh` fornece comandos úteis:

| Comando | Descrição |
|---------|-----------|
| `up` | Inicia Angular e JSON Server |
| `down` | Para e remove containers |
| `build` | Constrói as imagens Docker |
| `rebuild` | Reconstrói imagens (sem cache) |
| `logs [serviço]` | Mostra logs (ex: `logs angular`) |
| `test` | Roda testes Karma |
| `test:watch` | Roda Karma em modo watch |
| `cypress` | Abre Cypress com VNC |
| `cypress:headless` | Roda Cypress headless |
| `shell` | Abre shell no container Angular |
| `clean` | Remove tudo (containers, volumes, imagens) |

## 🏗️ Estrutura dos Serviços

### Serviços Principais

1. **angular**: Servidor de desenvolvimento Angular
   - Porta: 4200
   - Hot reload habilitado
   - Volumes montados para desenvolvimento

2. **json-server**: API mock
   - Porta: 3000
   - Banco de dados: `json-server/db.json`

### Serviços de Teste (profile: tests)

3. **karma**: Testes unitários
   - Porta: 9876 (interface web do Karma)
   - Chrome headless configurado

4. **cypress**: Testes E2E com VNC
   - Porta 6080: noVNC (web interface)
   - Porta 5900: VNC server
   - Permite visualizar o browser rodando os testes

5. **cypress-headless**: Testes E2E sem visualização
   - Execução rápida sem interface

## 🔧 Configuração

### Variáveis de Ambiente

O `docker-compose.yml` configura automaticamente:
- `API_PROXY_HOST=json-server` (para o Angular se conectar à API)
- `CHROME_BIN=/usr/bin/chromium` (para Karma)
- `DISPLAY=:99` (para browsers headless)

### Volumes

- Código fonte montado como volume para hot reload
- `node_modules` como volume nomeado (performance)
- Screenshots e vídeos do Cypress em volumes nomeados

## 🐛 Troubleshooting

### Porta já em uso
Se alguma porta estiver em uso, pare o serviço local ou altere as portas no `docker-compose.yml`.

### VNC não abre
- Aguarde alguns segundos após iniciar o Cypress
- Verifique se a porta 6080 não está em uso
- Tente acessar diretamente: http://localhost:6080/vnc.html

### Testes falhando
- Verifique se os serviços `angular` e `json-server` estão rodando
- Verifique os logs: `./docker/scripts.sh logs`

### Limpar tudo e recomeçar
```bash
./docker/scripts.sh clean
./docker/scripts.sh rebuild
./docker/scripts.sh up
```

## 📚 Comandos Docker Compose Diretos

Se preferir usar docker-compose diretamente:

```bash
# Iniciar serviços
docker-compose up -d

# Iniciar com testes
docker-compose --profile tests up -d

# Ver logs
docker-compose logs -f angular

# Executar comando no container
docker-compose exec angular npm test

# Reconstruir imagens
docker-compose build --no-cache
```

## 🔐 Segurança

- O VNC está configurado sem senha por padrão (apenas para desenvolvimento)
- Para produção, configure senha no `docker-compose.yml`

