$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🚀 Iniciando ambiente de desenvolvimento..."

try {
    docker compose -f docker-compose.dev.yml down --remove-orphans | Out-Null
} catch {
    # Ignora erros caso não haja containers anteriores
}

# Reconstroi as imagens para garantir que alterações em db.json e código sejam refletidas
docker compose -f docker-compose.dev.yml build

docker compose -f docker-compose.dev.yml up
