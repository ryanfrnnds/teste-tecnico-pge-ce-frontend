FROM node:22-alpine
WORKDIR /app
COPY db.json server.json ./
# Fixando versão estável compatível com os argumentos usados
RUN npm install -g json-server@0.17.4
EXPOSE 3000
CMD ["json-server","db.json","--config","server.json"]
