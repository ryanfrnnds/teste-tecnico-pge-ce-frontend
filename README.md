
# Projeto Teste PGE

Este repositório contém o projeto base para implementação do teste técnico solicitado.
O objetivo é oferecer um ambiente totalmente funcional e padronizado, executável sem instalações locais de Node ou Angular — **apenas Docker**.

---

## 📑 Índice

- [🚀 Objetivos do Projeto](#-objetivos-do-projeto)
- [🚧 Status do Projeto](#-status-do-projeto)
- [📄 Referências (PDF)](#-referências)
- [🧱 Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [🔥 Como Iniciar (Desenvolvimento)](#-ambiente-de-desenvolvimento-hot-reload-via-docker)
- [🛠️ Scripts Facilitadores](#scripts-facilitadores-atalhos)
- [🏭 Produção / Build](#-ambiente-de-produção--build)
- [🧩 Sobre o PrimeFlex](#-sobre-a-escolha-do-primeflex-importante)
- [🐳 Por que Docker?](#-por-que-usar-docker)
- [🌐 Proxy & CORS](#-proxy-de-desenvolvimento-cors-resolvido-no-angular)
- [📂 Estrutura de Arquivos](#-estrutura-do-projeto)
- [🔄 CI/CD & Versionamento](#-cicd--versionamento)

---

# 🚀 Objetivos do Projeto

Este projeto serve como base para a futura implementação de:

- Formulário completo de cadastro de cliente  
- Máscaras, validações e comportamento dinâmico (Reactive Forms)  
- Listagem com filtros e paginação  
- Preservação de estado  
- Componentização (ex.: modal reutilizável)  
- Comunicação com API mock via json-server  
- Observabilidade e feedback ao usuário (Toast / Logs)  
- Testes unitários  

Por enquanto, este projeto contém **apenas a infraestrutura**, sem implementar ainda as funcionalidades do teste.

---

# 🧱 Tecnologias Utilizadas

- **Angular 19**
- **PrimeNG 19**
- **PrimeFlex 4**
- **PrimeIcons**
- **json-server**
- **Docker & Docker Compose**
  - Node 22 (via container)
  - Nginx 1.27 (via container - produção)
- **Node + NVM** (uso opcional - apenas se preferir rodar localmente sem Docker)

---

# 🧩 Sobre a escolha do PrimeFlex (IMPORTANTE)

O projeto usa **PrimeFlex 4** apenas porque se trata de um **teste técnico** e a prioridade é fornecer:

- agilidade no desenvolvimento do layout;
- integração natural com o ecossistema PrimeNG;
- responsividade rápida sem boilerplate ou CSS excessivo.

No entanto, é essencial reforçar:

## ❗ PrimeFlex está oficialmente em processo de "sunset"

A própria PrimeTek anunciou publicamente que o PrimeFlex **não será mais foco de desenvolvimento**, e que a recomendação para novos projetos é utilizar **Tailwind CSS**.

🔗 **Fonte oficial:**  
https://primeflex.org  
Mensagem oficial: _“PrimeFlex is being sunset.”_

### ✔ Conclusão sobre o uso do PrimeFlex
O PrimeFlex é utilizado **somente para este teste**.  
Em projetos reais, corporativos e de longo prazo, a recomendação seria:

- Tailwind CSS (preferência da própria PrimeTek)
- Outro framework utility-first moderno

---

# 🐳 Por que usar Docker?

Este projeto foi estruturado para que **nenhuma instalação local seja necessária**, exceto o Docker.

### Benefícios:

- Ambiente isolado e padronizado entre revisores e desenvolvedores  
- Elimina diferenças de versões de Node, Angular CLI, libs globais etc.  
- Hot Reload funcionando dentro do Docker  
- Aproximação natural de ambientes reais de CI/CD  
- Simplicidade: apenas `docker compose up`  

---

# 📂 Estrutura do Projeto

```
teste-pge/
├── src/
│   ├── app/
│   ├── assets/
│   └── styles.scss
│
├── json-server/
│   ├── db.json
│   └── server.json
│
├── nginx/
│   └── default.conf
│
├── proxy.conf.json
├── Dockerfile
├── Dockerfile.dev
├── docker-compose.yml
├── docker-compose.dev.yml
└── README.md
```

---

# 🔄 CI/CD & Versionamento

O projeto conta com um pipeline automatizado via **GitHub Actions** configurado para a branch `dev`.

### Estratégia de Tags (Simulação)
Como estamos simulando um ambiente de desenvolvimento contínuo, adotamos a seguinte estratégia para controle de histórico:

1.  **Branch Principal:** `dev`
2.  **Automação:** A cada **push** na branch `dev`, o workflow:
    *   Calcula a próxima versão baseada na última tag (SemVer).
    *   Incrementa o *Patch Version*.
    *   Adiciona o sufixo `-SNAPSHOT`.
    *   Gera uma **Tag Git** automaticamente (ex: `v0.0.4-SNAPSHOT`).

> ℹ️ **Nota:** Em um cenário real corporativo, este fluxo seria complementado por Pull Requests, Code Reviews e branches estáveis (`main`/`master`) gerando versões de release sem o sufixo snapshot. Aqui, o foco é demonstrar a automação e organização do histórico.

---

# 🌐 Proxy de Desenvolvimento (CORS resolvido no Angular)

Durante o desenvolvimento:

- Angular dev server → `http://localhost:4200`
- json-server → `http://localhost:3000`

Isso naturalmente criaria problemas de CORS no navegador.

Em sistemas reais, isso poderia ser resolvido de várias formas:

- configurar CORS no backend real  
- colocar tudo atrás de Nginx  
- usar API Gateway / BFF  
- usar proxies reversos dedicados  

Mas como este projeto lida apenas com **frontend + API mock**, usamos a solução mais simples e nativa:

## ✔ Proxy de desenvolvimento do Angular

Arquivo: `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://json-server:3000",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "info"
  }
}
```

Com isso:

- O Angular recebe as requisições via `http://localhost:4200/api/...`
- Ele repassa internamente para `http://json-server:3000`
- Zero problemas de CORS  
- Zero necessidade de configurar o json-server

> Esta escolha é **apenas para o teste**.  
> Em aplicações reais, a estratégia de proxy/CORS dependeria da arquitetura adotada.

---

# 🔥 Ambiente de Desenvolvimento (Hot Reload via Docker)

Este é o modo **recomendado**.

### Scripts Facilitadores (Atalhos)

Para agilizar o uso, foram criados scripts na pasta `scripts/` que abstraem os comandos longos do Docker.

| Ação | Windows (PowerShell) | Linux / Mac (Bash) | O que faz? |
|------|----------------------|--------------------|------------|
| **Iniciar** | `./scripts/start.ps1` | `./scripts/start.sh` | Sobe o ambiente (`up`) |
| **Parar** | `./scripts/stop.ps1` | `./scripts/stop.sh` | Para os containers (`down`) |
| **Atualizar** | `./scripts/update.ps1` | `./scripts/update.sh` | Reconstroi as imagens (`up --build`) |

> **Nota Linux/Mac:** Pode ser necessário dar permissão de execução: `chmod +x scripts/*.sh`

### 📌 Execução Manual (sem scripts)

Se preferir rodar manualmente:

```bash
docker compose -f docker-compose.dev.yml up --build
```

### 🌐 Endereços:

- Frontend → http://localhost:4200  
- API Mock (json-server) → http://localhost:3000/clientes  

### 🔄 Hot Reload:

Funciona normalmente porque os arquivos locais são montados como volume no container.

---

# 🏭 Ambiente de Produção / Build

Para rodar uma simulação do ambiente de produção:

```bash
docker compose up --build
```

Isso criará o build otimizado do Angular e servirá os arquivos estáticos.

### Sobre o Servidor Web
Atualmente, o projeto utiliza **Nginx** (via Docker) como servidor web de referência para entregar os arquivos estáticos do frontend.

No entanto, a escolha final da tecnologia de servidor web depende da infraestrutura da organização. Alternativas comuns incluem:
- **Apache HTTP Server**
- **IIS (Internet Information Services)**
- **Caddy**
- **Cloud Storage + CDN** (ex: AWS S3 + CloudFront, Azure Blob Storage)
- **Kubernetes Ingress**

O arquivo `nginx/default.conf` incluído serve apenas como **sugestão de configuração** para o contexto deste teste e contêineres Docker.

---

# 🧑‍💻 Execução LOCAL sem Docker (opcional)

Somente se desejar usar Node localmente.

### Requisitos:

- Node 20+  
- Recomenda-se usar NVM:

```bash
nvm install 20
nvm use 20
```

### Instalar dependências:

```bash
npm install
```

### Subir frontend + API mock:

```bash
npm run start:dev:local
```

---

# 🚧 Status do Projeto

> **EM CONSTRUÇÃO** - Desenvolvimento em progresso. 🔨

As funcionalidades do teste estão sendo implementadas.

---

# 📄 Referências

Para consultar os requisitos completos do teste, acesse o arquivo PDF incluso no projeto:

[📕 Teste Prático - Especificações (PDF)](<referencias/Teste Prático - Desenvolvedor - Front-End - Procuradoria Geral do Estado do Ceará.pdf>)

---

# ✔ Conclusão

Este projeto entrega:

- Ambiente Angular completo  
- PrimeNG + PrimeFlex configurados  
- API mock dockerizada  
- Proxy Angular para evitar CORS  
- Docker para dev e produção  
- Hot reload funcional  
- Estrutura organizada e limpa para iniciar o teste  

Totalmente pronto para desenvolvimento — basta abrir no editor e iniciar!

