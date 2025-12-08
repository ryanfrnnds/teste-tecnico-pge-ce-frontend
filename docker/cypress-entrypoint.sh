#!/bin/bash
set -e

# Iniciar Xvfb (X Virtual Framebuffer)
Xvfb :99 -screen 0 1920x1080x24 -ac +extension GLX +render -noreset > /dev/null 2>&1 &
export DISPLAY=:99

# Aguardar Xvfb iniciar
sleep 2

# Iniciar window manager
fluxbox > /dev/null 2>&1 &

# Iniciar VNC server
x11vnc -display :99 -nopw -listen 0.0.0.0 -xkb -ncache 10 -ncache_cr -forever -shared -rfbport 5900 > /dev/null 2>&1 &

# Iniciar noVNC (web-based VNC client)
if [ -x /opt/noVNC/utils/novnc_proxy ]; then
  cd /opt/noVNC && ./utils/novnc_proxy --vnc localhost:5900 --listen 0.0.0.0:6080 > /dev/null 2>&1 &
else
  /usr/share/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 0.0.0.0:6080 > /dev/null 2>&1 &
fi

# Aguardar um pouco para os serviços iniciarem
sleep 3

echo "=========================================="
echo "VNC está rodando!"
echo "Acesse: http://localhost:6080/vnc.html"
echo "Senha VNC: $VNC_PASSWORD"
echo "=========================================="

BASE_URL="${CYPRESS_baseUrl:-http://angular-cypress:4200}"
echo "Usando baseUrl: $BASE_URL"

# Executar comando passado (ou abrir Cypress por padrão) e manter container vivo
if [ $# -eq 0 ]; then
    echo "Abrindo Cypress..."
    npx cypress open --config baseUrl="$BASE_URL" --project /app --browser chrome &
    CYPRESS_PID=$!
    echo "Cypress PID: $CYPRESS_PID"
    # Mantém o container vivo mesmo após o Cypress fechar
    wait $CYPRESS_PID || true
    echo "Cypress finalizado; mantendo VNC/Xvfb ativos. Pressione Ctrl+C para parar o container."
    tail -f /dev/null
else
    exec "$@"
fi
