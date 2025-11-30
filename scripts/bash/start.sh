#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "🚀 Iniciando ambiente de desenvolvimento..."

# Garante que qualquer container antigo seja removido (inclui json-server, zerando o estado)
docker compose -f docker-compose.dev.yml down --remove-orphans >/dev/null 2>&1 || true

# Reconstroi as imagens para garantir que alterações em db.json e código sejam refletidas
docker compose -f docker-compose.dev.yml build

docker compose -f docker-compose.dev.yml up
