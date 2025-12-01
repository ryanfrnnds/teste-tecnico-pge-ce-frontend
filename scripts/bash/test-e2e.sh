#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "🧪 Executando testes E2E (Cypress) em Docker..."
echo "➡️  App sob teste ficará disponível em http://localhost:4200 durante a execução."
echo

# Garante ambiente limpo
docker compose -f docker-compose.e2e.yml down --remove-orphans >/dev/null 2>&1 || true

# Executa o serviço cypress-e2e, usando o exit code dele como resultado do conjunto
docker compose -f docker-compose.e2e.yml up --build --exit-code-from cypress-e2e cypress-e2e

echo
echo "🧹 Encerrando ambiente E2E..."
docker compose -f docker-compose.e2e.yml down --remove-orphans -v

echo "✅ Testes E2E finalizados."


