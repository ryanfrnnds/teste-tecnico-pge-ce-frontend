#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "🧪 Executando testes unitários (Karma) em Docker..."
echo

# Garante que as imagens estejam atualizadas
docker compose -f docker-compose.test.yml build

# Sobe json-server de teste e roda o serviço de testes uma única vez
docker compose -f docker-compose.test.yml run --rm frontend-test npm run test -- --watch=false --browsers=ChromeHeadlessNoSandbox

echo
echo "🧹 Encerrando ambiente de teste..."
docker compose -f docker-compose.test.yml down --remove-orphans -v

echo "✅ Testes unitários finalizados."


