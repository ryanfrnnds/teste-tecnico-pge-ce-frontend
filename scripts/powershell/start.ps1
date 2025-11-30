$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🚀 Iniciando ambiente de desenvolvimento..."
docker compose -f docker-compose.dev.yml up
