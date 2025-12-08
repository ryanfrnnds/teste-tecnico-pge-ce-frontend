@echo off
REM Scripts auxiliares para Windows - Docker Compose

if "%1"=="" (
    echo Iniciando servicos...
    echo Removendo containers existentes...
    docker-compose rm -f angular json-server 2>nul
    docker-compose up -d --force-recreate angular json-server
    echo Servicos iniciados!
    echo Angular: http://localhost:4200
    echo JSON Server: http://localhost:3000
    exit /b 0
)

if "%1"=="up" (
    echo Iniciando servicos...
    echo Removendo containers existentes...
    docker-compose rm -f angular json-server 2>nul
    docker-compose up -d --force-recreate angular json-server
    echo Servicos iniciados!
    echo Angular: http://localhost:4200
    echo JSON Server: http://localhost:3000
    exit /b 0
)

if "%1"=="down" (
    echo Parando servicos...
    docker-compose down
    exit /b 0
)

if "%1"=="build" (
    echo Construindo imagens...
    docker-compose build
    exit /b 0
)

if "%1"=="rebuild" (
    echo Reconstruindo imagens (sem cache)...
    docker-compose build --no-cache
    exit /b 0
)

if "%1"=="logs" (
    if "%2"=="" (
        docker-compose logs -f
    ) else (
        docker-compose logs -f %2
    )
    exit /b 0
)

if "%1"=="test" (
    echo Rodando testes Karma...
    docker-compose --profile tests run --rm karma
    exit /b 0
)

if "%1"=="test:watch" (
    echo Rodando testes Karma em modo watch...
    echo Acesse http://localhost:9876 para ver a interface do Karma
    docker-compose --profile tests up karma
    exit /b 0
)

if "%1"=="cypress" (
    echo Iniciando Cypress com VNC...
    echo Aguarde alguns segundos para o VNC iniciar...
    docker-compose --profile tests up cypress
    exit /b 0
)

if "%1"=="cypress:headless" (
    echo Rodando Cypress em modo headless...
    docker-compose --profile tests run --rm cypress-headless
    exit /b 0
)

if "%1"=="shell" (
    echo Abrindo shell no container Angular...
    docker-compose exec angular /bin/bash
    exit /b 0
)

if "%1"=="clean" (
    echo Limpando containers, volumes e imagens...
    docker-compose down -v --rmi all
    echo Limpeza concluida!
    exit /b 0
)

if "%1"=="help" (
    echo Uso: docker\scripts.bat [comando]
    echo.
    echo Comandos disponiveis:
    echo   up              - Inicia os servicos Angular e JSON Server
    echo   down            - Para e remove os containers
    echo   build           - Constrói as imagens Docker
    echo   rebuild         - Reconstrói as imagens Docker (sem cache)
    echo   logs [servico]  - Mostra os logs dos servicos
    echo   test            - Roda testes Karma
    echo   test:watch      - Roda testes Karma em modo watch
    echo   cypress         - Abre Cypress com VNC (acesse http://localhost:6080/vnc.html)
    echo   cypress:headless - Roda Cypress em modo headless
    echo   shell           - Abre shell no container Angular
    echo   clean           - Remove containers, volumes e imagens
    exit /b 0
)

echo Comando desconhecido: %1
echo Use "docker\scripts.bat help" para ver os comandos disponiveis
exit /b 1

