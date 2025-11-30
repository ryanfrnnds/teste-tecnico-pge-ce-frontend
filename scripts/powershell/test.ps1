$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🧪 Executando testes unitários no Docker (Ambiente Isolado)..."

# Executa o teste
docker compose -f docker-compose.dev.yml run --rm --service-ports frontend-dev npm run test -- --watch=false --browsers=ChromeHeadlessNoSandbox --progress=false
$testExitCode = $LASTEXITCODE

Write-Host "🧹 Limpando containers de suporte (json-server)..."
docker compose -f docker-compose.dev.yml down

exit $testExitCode
