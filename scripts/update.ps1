Write-Host "🔄 Atualizando e recriando containers..."
docker compose -f docker-compose.dev.yml up --build
