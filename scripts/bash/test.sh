#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "🧪 Iniciando ambiente de testes unitários (Modo Watch - 10 minutos)..."
echo "ℹ️  Ambiente completamente isolado do desenvolvimento:"
echo "   - Json-server usando db.test.json"
echo "   - Testes em modo watch (auto-reload ao modificar arquivos)"
echo "   - Sem conflitos de porta"
echo ""
echo "⏱️  O ambiente ficará ativo por 10 minutos..."
echo "   Pressione Ctrl+C para encerrar antes."
echo ""

# Sobe o ambiente de teste em background
docker compose -f docker-compose.test.yml up -d

# Aguarda 10 minutos (600 segundos)
# Durante este tempo, os testes ficam rodando em modo watch
sleep 600

echo ""
echo "⏰ Tempo esgotado (10 minutos). Encerrando ambiente de teste..."
echo "🧹 Limpando containers de teste..."
docker compose -f docker-compose.test.yml down -v

echo "✅ Ambiente de teste encerrado!"
