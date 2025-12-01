#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "🧪 Executando testes unitários (Karma) em Docker..."
echo

# Sobe json-server de teste e roda o serviço de testes uma única vez
docker compose -f docker-compose.test.yml run --rm frontend-test

echo
echo "🧹 Encerrando ambiente de teste..."
docker compose -f docker-compose.test.yml down --remove-orphans -v

echo "✅ Testes unitários finalizados."


