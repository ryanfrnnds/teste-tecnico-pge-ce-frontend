$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🔄 Atualizando containers..."
docker compose -f docker-compose.dev.yml up --build -d
