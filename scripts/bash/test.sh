#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/../.."
cd "$PROJECT_ROOT"

echo "🧪 Iniciando ambiente de testes unitários (Modo Watch - 10 minutos)..."
echo "ℹ️  Ambiente completamente isolado do desenvolvimento:"
echo "   - Json-server usando db.test.json"
echo "   - Testes em modo watch (auto-reload ao modificar arquivos)"
echo "   - Interface do Karma: http://localhost:9876"
echo "   - Sem conflitos de porta"
echo ""
echo "⏱️  O ambiente ficará ativo por 10 minutos..."
echo "   Pressione Ctrl+C para encerrar antes."
echo ""

# Função para limpar containers ao sair
cleanup() {
    echo ""
    echo "🧹 Encerrando e limpando containers de teste..."
    docker compose -f docker-compose.test.yml down -v
    echo "✅ Ambiente de teste encerrado!"
    exit 0
}

# Configura trap para capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Sobe o ambiente de teste
docker compose -f docker-compose.test.yml up -d

# Aguarda 10 minutos (600 segundos) em foreground
echo "⏳ Aguardando 10 minutos... (Ctrl+C para encerrar antes)"
sleep 600

# Após 10 minutos, executa o cleanup
echo ""
echo "⏰ Tempo esgotado (10 minutos). Encerrando ambiente de teste..."
cleanup
