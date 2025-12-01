$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🧪 Executando testes E2E (Cypress) em Docker..." -ForegroundColor Cyan
Write-Host "➡️  App sob teste ficará disponível em http://localhost:4200 durante a execução." -ForegroundColor Cyan
Write-Host ""

try {
    # Garante ambiente limpo antes de iniciar
    docker compose -f docker-compose.e2e.yml down --remove-orphans | Out-Null
} catch {
    # Ignora erros caso não haja containers anteriores
}

try {
    # Executa o serviço de Cypress, usando o exit code dele como resultado
    docker compose -f docker-compose.e2e.yml up --build --exit-code-from cypress-e2e cypress-e2e
}
finally {
    Write-Host ""
    Write-Host "🧹 Encerrando ambiente E2E..." -ForegroundColor Yellow
    docker compose -f docker-compose.e2e.yml down --remove-orphans -v | Out-Null
    Write-Host "✅ Testes E2E finalizados." -ForegroundColor Green
}


