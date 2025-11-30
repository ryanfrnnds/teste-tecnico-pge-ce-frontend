#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "🧨 Removendo TUDO (Containers, Imagens, Volumes, Redes)..."

docker compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans

echo "🧹 Limpeza concluída!"

