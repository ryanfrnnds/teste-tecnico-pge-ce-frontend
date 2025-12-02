#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "🧪 Executando testes unitários (Karma) em Docker..."
echo

# Remove container antigo, se existir, para evitar conflito de nome
if docker ps -a --format '{{.Names}}' | grep -q "^teste-pge-unit$"; then
  echo "🧹 Removendo container antigo de testes (teste-pge-unit)..."
  docker rm -f teste-pge-unit >/dev/null 2>&1 || true
fi

# Garante que as imagens estejam atualizadas
docker compose -f docker-compose.test.yml build

# Roda os testes em modo watch dentro do container, preso a este terminal.
# Para sair, basta CTRL+C (isso encerra o processo de testes e o container `frontend-test`).
docker compose -f docker-compose.test.yml run --name teste-pge-unit frontend-test npm run test -- --browsers=ChromeHeadlessNoSandbox

echo
echo "✅ Execução de testes unitários encerrada."


