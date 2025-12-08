# Rodando Testes Karma com Browser Local

Este guia explica como rodar os testes Karma no Docker mas usar seu browser local para visualizar e interagir com os testes.

## Opções Disponíveis

### 1. Modo Headless (Padrão)
Roda os testes sem interface gráfica, ideal para CI/CD:

```bash
./docker/scripts.sh test
```

### 2. Modo Watch com Browser no Docker
Roda os testes com interface web, mas o browser fica dentro do container:

```bash
./docker/scripts.sh test:watch
```

Acesse: http://localhost:9876

### 3. Modo Remoto (Browser Local) ⭐
Roda o Karma no Docker mas permite usar seu browser local:

```bash
./docker/scripts.sh test:remote
```

**Passos:**
1. Execute o comando acima
2. Aguarde o log "Karma vX.X.X server started" e "No captured browser"
3. Abra seu browser local e acesse: **http://localhost:9876**
4. Clique em **Debug** (ou mantenha a aba aberta)
5. O Karma detectará seu browser e executará os testes

## Vantagens do Modo Remoto

- ✅ Visualização completa dos testes no seu browser
- ✅ Pode usar DevTools do Chrome para debug
- ✅ Melhor performance (browser nativo)
- ✅ Acesso a todas as extensões do browser
- ✅ Interface mais responsiva

## Troubleshooting

### Browser não conecta
- Verifique se a porta 9876 está acessível
- Certifique-se de que não há firewall bloqueando
- Tente acessar http://localhost:9876 diretamente

### Testes não executam
- Verifique os logs do container: `docker-compose logs karma-remote`
- Certifique-se de que o json-server está rodando
- Verifique se há erros de compilação TypeScript

### Porta já em uso
Se a porta 9876 estiver em uso, você pode alterar no `docker-compose.yml`:

```yaml
ports:
  - "9877:9876"  # Use 9877 localmente
```

E acesse: http://localhost:9877

## Configuração Avançada

Para usar um browser específico, você pode definir a variável de ambiente:

```bash
KARMA_BROWSER=ChromeRemote ./docker/scripts.sh test:remote
```

Browsers disponíveis:
- `ChromeHeadlessNoSandbox` - Headless (padrão)
- `ChromeRemote` - Chrome com debugging remoto
- `Chrome` - Chrome normal (requer display)

