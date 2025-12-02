FROM node:22-alpine
WORKDIR /app
COPY db.json server.js ./
# Fixando versão estável compatível com os argumentos usados
RUN npm install -g json-server@0.17.4 && npm install json-server@0.17.4
EXPOSE 3000
CMD ["node","server.js"]
