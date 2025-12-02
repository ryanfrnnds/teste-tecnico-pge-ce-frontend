$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🧪 Executando testes unitários (Karma) em Docker..." -ForegroundColor Cyan
Write-Host ""

try {
    # Remove container antigo, se existir, para evitar conflito de nome
    $existing = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq "teste-pge-unit" }
    if ($existing) {
        Write-Host "🧹 Removendo container antigo de testes (teste-pge-unit)..." -ForegroundColor Yellow
        docker rm -f teste-pge-unit | Out-Null
    }

    # Garante que as imagens estejam atualizadas
    docker compose -f docker-compose.test.yml build

    # Roda os testes em modo watch dentro do container, preso a este terminal.
    # Para sair, basta CTRL+C (isso encerra o processo de testes e o container `frontend-test`).
    docker compose -f docker-compose.test.yml run --rm frontend-test npm run test -- --browsers=ChromeHeadlessNoSandbox
}
finally {
    Write-Host ""
    Write-Host "✅ Execução de testes unitários encerrada." -ForegroundColor Green
}


