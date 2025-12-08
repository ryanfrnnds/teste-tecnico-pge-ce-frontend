#!/bin/bash
set -e

cd /app/json-server

# O node_modules está na imagem (do build), então require('json-server') deve funcionar
echo "Iniciando JSON Server customizado..."
exec node server.js

