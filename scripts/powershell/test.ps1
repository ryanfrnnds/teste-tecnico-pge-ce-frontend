$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🧪 Iniciando ambiente de testes unitários (Modo Watch - 10 minutos)..."
Write-Host "ℹ️  Ambiente completamente isolado do desenvolvimento:"
Write-Host "   - Json-server usando db.test.json"
Write-Host "   - Testes em modo watch (auto-reload ao modificar arquivos)"
Write-Host "   - Sem conflitos de porta"
Write-Host ""
Write-Host "⏱️  O ambiente ficará ativo por 10 minutos..."
Write-Host "   Pressione Ctrl+C para encerrar antes."
Write-Host ""

# Sobe o ambiente de teste em background
docker compose -f docker-compose.test.yml up -d

# Aguarda 10 minutos (600 segundos)
# Durante este tempo, os testes ficam rodando em modo watch
Start-Sleep -Seconds 600

Write-Host ""
Write-Host "⏰ Tempo esgotado (10 minutos). Encerrando ambiente de teste..."
Write-Host "🧹 Limpando containers de teste..."
docker compose -f docker-compose.test.yml down -v

Write-Host "✅ Ambiente de teste encerrado!"
