#!/bin/bash
set -e

echo "Starting JSON Server on port ${PORT:-3000}..."
cd /app/json-server
exec node server.js
