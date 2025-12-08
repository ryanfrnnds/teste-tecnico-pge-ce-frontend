#!/bin/bash

# Scripts auxiliares para gerenciar o Docker Compose

set -e

# Função para limpar containers ao sair
cleanup() {
    if [ -n "$CLEANUP_NEEDED" ]; then
        echo -e "\n${YELLOW}Limpando containers...${NC}"
        docker-compose --profile tests down 2>/dev/null || true
        docker-compose down 2>/dev/null || true
    fi
    exit 0
}

# Trap para limpar ao receber SIGINT ou SIGTERM
trap cleanup SIGINT SIGTERM EXIT

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para exibir ajuda
show_help() {
    echo -e "${BLUE}Uso: ./docker/scripts.sh [comando]${NC}"
    echo ""
    echo "Comandos disponíveis:"
    echo "  ${GREEN}up${NC}              - Inicia os serviços Angular e JSON Server"
    echo "  ${GREEN}down${NC}            - Para e remove os containers"
    echo "  ${GREEN}build${NC}           - Constrói as imagens Docker"
    echo "  ${GREEN}rebuild${NC}         - Reconstrói as imagens Docker (sem cache)"
    echo "  ${GREEN}logs${NC}            - Mostra os logs dos serviços"
    echo "  ${GREEN}test${NC}            - Roda testes Karma"
    echo "  ${GREEN}test:watch${NC}      - Roda testes Karma em modo watch"
    echo "  ${GREEN}test:remote${NC}     - Roda testes Karma aguardando browser local (acesse http://localhost:9876)"
    echo "  ${GREEN}cypress${NC}         - Abre Cypress com VNC (acesse http://localhost:6080/vnc.html)"
    echo "  ${GREEN}cypress:headless${NC} - Roda Cypress em modo headless"
    echo "  ${GREEN}shell${NC}           - Abre shell no container Angular"
    echo "  ${GREEN}clean${NC}           - Remove containers, volumes e imagens"
    echo ""
}

# Comando padrão: iniciar serviços
if [ $# -eq 0 ]; then
    CLEANUP_NEEDED=1
    echo -e "${GREEN}Iniciando serviços...${NC}"
    echo -e "${YELLOW}Removendo containers existentes...${NC}"
    docker-compose rm -f angular json-server 2>/dev/null || true
    docker-compose up --force-recreate angular json-server
    exit 0
fi

case "$1" in
    up)
        CLEANUP_NEEDED=1
        echo -e "${GREEN}Iniciando serviços...${NC}"
        echo -e "${YELLOW}Removendo containers existentes...${NC}"
        docker-compose rm -f angular json-server 2>/dev/null || true
        docker-compose up --force-recreate angular json-server
        ;;
    
    down)
        echo -e "${YELLOW}Parando serviços...${NC}"
        docker-compose down
        ;;
    
    build)
        echo -e "${GREEN}Construindo imagens...${NC}"
        docker-compose build
        ;;
    
    rebuild)
        echo -e "${GREEN}Reconstruindo imagens (sem cache)...${NC}"
        docker-compose build --no-cache
        ;;
    
    logs)
        docker-compose logs -f "${2:-}"
        ;;
    
    test)
        echo -e "${GREEN}Rodando testes Karma (headless, coverage)...${NC}"
        docker-compose --profile tests run karma
        ;;
    
    test:watch)
        CLEANUP_NEEDED=1
        echo -e "${GREEN}Rodando testes Karma em modo watch (capture, navegador local)...${NC}"
        echo -e "${BLUE}Abra http://localhost:9876 no seu navegador local${NC}"
        docker-compose --profile tests up karma-remote
        ;;
    
    test:remote)
        CLEANUP_NEEDED=1
        echo -e "${GREEN}Rodando testes Karma em modo remoto (capture, navegador local)...${NC}"
        echo -e "${BLUE}1. Abra http://localhost:9876 no seu navegador local${NC}"
        echo -e "${BLUE}2. Clique em \"Debug\" no Karma runner${NC}"
        docker-compose --profile tests up karma-remote
        ;;
    
    cypress)
        CLEANUP_NEEDED=1
        echo -e "${GREEN}Iniciando Cypress com VNC...${NC}"
        echo -e "${YELLOW}Aguarde alguns segundos para o VNC iniciar...${NC}"
        docker-compose --profile tests up cypress
        ;;
    
    cypress:headless)
        echo -e "${GREEN}Rodando Cypress em modo headless...${NC}"
        docker-compose --profile tests run --rm cypress-headless
        ;;
    
    shell)
        echo -e "${GREEN}Abrindo shell no container Angular...${NC}"
        docker-compose exec angular /bin/bash
        ;;
    
    clean)
        echo -e "${YELLOW}Limpando containers, volumes e imagens...${NC}"
        docker-compose down -v --rmi all
        echo -e "${GREEN}Limpeza concluída!${NC}"
        ;;
    
    help|--help|-h)
        show_help
        ;;
    
    *)
        echo -e "${YELLOW}Comando desconhecido: $1${NC}"
        show_help
        exit 1
        ;;
esac

