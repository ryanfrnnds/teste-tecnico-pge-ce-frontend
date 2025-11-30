FROM node:22-alpine
WORKDIR /app
COPY db.json server.json ./
RUN npm install -g json-server
EXPOSE 3000
CMD ["json-server","db.json","--config","server.json"]
