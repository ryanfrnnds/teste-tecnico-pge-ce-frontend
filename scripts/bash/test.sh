#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "🧪 Executando testes unitários no Docker (Ambiente Isolado)..."

# Executa o teste e captura o código de saída
docker compose -f docker-compose.dev.yml run --rm --service-ports frontend-dev npm run test -- --watch=false --browsers=ChromeHeadlessNoSandbox --progress=false
EXIT_CODE=$?

echo "🧹 Limpando containers de suporte (json-server)..."
docker compose -f docker-compose.dev.yml down

exit $EXIT_CODE
