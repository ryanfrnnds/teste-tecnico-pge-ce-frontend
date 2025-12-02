$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🧪 Executando testes unitários (Karma) em Docker..." -ForegroundColor Cyan
Write-Host ""

try {
    # Garante que as imagens estejam atualizadas
    docker compose -f docker-compose.test.yml build

    docker compose -f docker-compose.test.yml run --rm frontend-test npm run test -- --watch=false --browsers=ChromeHeadlessNoSandbox
}
finally {
    Write-Host ""
    Write-Host "🧹 Encerrando ambiente de teste..." -ForegroundColor Yellow
    docker compose -f docker-compose.test.yml down --remove-orphans -v | Out-Null
    Write-Host "✅ Testes unitários finalizados." -ForegroundColor Green
}


