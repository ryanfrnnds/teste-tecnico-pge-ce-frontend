$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🧪 Executando testes unitários (Karma) em Docker..." -ForegroundColor Cyan
Write-Host ""

try {
    docker compose -f docker-compose.test.yml run --rm frontend-test
}
finally {
    Write-Host ""
    Write-Host "🧹 Encerrando ambiente de teste..." -ForegroundColor Yellow
    docker compose -f docker-compose.test.yml down --remove-orphans -v | Out-Null
    Write-Host "✅ Testes unitários finalizados." -ForegroundColor Green
}


