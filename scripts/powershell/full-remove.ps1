$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🧨 Removendo TUDO (Containers, Imagens, Volumes, Redes)..."

docker compose -f docker-compose.dev.yml down --rmi all --volumes --remove-orphans

Write-Host "🧹 Limpeza concluída!"

