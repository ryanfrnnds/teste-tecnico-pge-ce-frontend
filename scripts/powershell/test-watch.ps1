$ScriptDir = Split-Path $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path "$ScriptDir\..\.."
Set-Location $ProjectRoot

Write-Host "🧪 Iniciando servidor de testes (Watch Mode - Tempo Limitado)..."
Write-Host "🌍 Abra http://localhost:9876 no seu navegador para ver os resultados."
Write-Host "⏳ O container permanecerá ativo por 10 minutos e depois será encerrado automaticamente."

# Roda em background
docker compose -f docker-compose.dev.yml run -d --rm --service-ports -p 9876:9876 --name teste-pge-debug frontend-dev ng test --watch=true --browsers=ChromeHeadlessNoSandbox --poll=2000

# Abre uma janela separada ou job para mostrar logs (simplificado para PowerShell: apenas aguarda)
# Em PS complexo seria Start-Job, mas aqui vamos simplificar: avisar o usuário
Write-Host "⚠️  Para ver os logs, execute em outro terminal: docker logs -f teste-pge-debug"

# Aguarda 10 minutos
Start-Sleep -Seconds 600

Write-Host "🛑 Tempo limite de 10 minutos atingido. Encerrando container..."
docker stop teste-pge-debug
