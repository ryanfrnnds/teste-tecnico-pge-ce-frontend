$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🧪 Iniciando ambiente de testes unitários (Modo Watch - 10 minutos)..."
Write-Host "ℹ️  Ambiente completamente isolado do desenvolvimento:"
Write-Host "   - Json-server usando db.test.json"
Write-Host "   - Testes em modo watch (auto-reload ao modificar arquivos)"
Write-Host "   - Interface do Karma: http://localhost:9876"
Write-Host "   - Sem conflitos de porta"
Write-Host ""
Write-Host "⏱️  O ambiente ficará ativo por 10 minutos..."
Write-Host "   Pressione Ctrl+C para encerrar antes."
Write-Host ""

# Função para limpar containers
function Cleanup {
    Write-Host ""
    Write-Host "🧹 Encerrando e limpando containers de teste..."
    docker compose -f docker-compose.test.yml down -v
    Write-Host "✅ Ambiente de teste encerrado!"
    exit 0
}

# Configura handler para Ctrl+C
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup }

try {
    # Sobe o ambiente de teste
    docker compose -f docker-compose.test.yml up -d

    # Aguarda 10 minutos (600 segundos)
    Write-Host "⏳ Aguardando 10 minutos... (Ctrl+C para encerrar antes)"
    Start-Sleep -Seconds 600

    # Após 10 minutos, executa o cleanup
    Write-Host ""
    Write-Host "⏰ Tempo esgotado (10 minutos). Encerrando ambiente de teste..."
    Cleanup
}
catch {
    Cleanup
}
