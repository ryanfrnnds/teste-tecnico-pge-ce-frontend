# Teste Técnico - Frontend Angular (PGE)

Este projeto é a solução proposta para o desafio técnico de Front-End, consistindo em um Sistema de Gestão de Clientes com autenticação e registro de logs. O meu objetivo principal foi demonstrar proficiência nas versões mais recentes do Angular (17+), padrões de arquitetura limpa e estratégias robustas de teste.

---

## 🎯 O Desafio

O desafio consistia em criar uma aplicação SPA (Single Page Application) que permitisse:
1. **Gestão de Clientes:** CRUD completo (Criar, Ler, Atualizar, Deletar) com validações específicas.
2. **Auditoria:** Registro automático de logs das operações realizadas.

O foco não foi apenas "fazer funcionar", mas estruturar uma aplicação escalável, testável e pronta para manutenção a longo prazo.

---

## 🏗️ Decisões Arquiteturais e Técnicas

Para atender aos requisitos com excelência, adotei diversas decisões estratégicas:

### 1. Abordagem "Docker First"
Adotei uma mentalidade "Docker First" para garantir que o ambiente de execução seja idêntico para todos os desenvolvedores, independentemente do sistema operacional (Windows, Linux, Mac).
- **Consistência:** Eliminei o famoso "na minha máquina funciona". O ambiente é containerizado, garantindo versões exatas de Node.js, Nginx e dependências.
- **Facilidade:** Com um único comando, subo toda a infraestrutura necessária (Frontend + Backend Mock), sem a necessidade de instalar ferramentas complexas localmente além do Docker.

### 2. Arquitetura em Camadas e Organização das Pastas

Fugi do padrão comum de agrupar tudo por funcionalidades e adotei uma estrutura propositalmente mais "acadêmica" para **evidenciar as camadas da arquitetura** neste teste técnico.

> **Importante:** Essa organização foi adotada para deixar explícito como o frontend pode ser estruturado seguindo princípios de Clean Architecture, mesmo em um projeto Angular.

A estrutura ficou dividida da seguinte forma:

- **`src/app/apresentacao` (Camada de Apresentação/UI):**
  Components, pages, directives e pipes responsáveis por renderizar a interface e orquestrar a interação com o usuário.

- **`src/app/negocio` (Camada de Aplicação/Regras de Negócio):**
  Casos de uso (UseCases) e orquestrações de fluxo da aplicação. Aqui não há detalhes de UI nem de infraestrutura.

- **`src/app/dominio` (Camada de Domínio):**
  Modelos, enums e validações de domínio. Código o mais puro possível, sem dependência de Angular/HTTP.

- **`src/app/infraestrutura` (Camada de Infraestrutura):**
  Implementações técnicas: serviços HTTP, interceptors, guards, resolvers e outros adapters que falam com APIs e recursos externos.

### 3. Reatividade Moderna (Angular 17+)
Abandonei a dependência excessiva de subscriptions manuais e `ngOnChanges`:
- **Signals & Computed:** Usados extensivamente para gerenciamento de estado local e derivado, garantindo renderização fina e performática.
- **Subjects:** Mantidos apenas onde necessário para compatibilidade ou fluxos de eventos específicos, mas encapsulados.
- **Formulários Reativos:** Para validações complexas e feedback visual imediato.

### 4. UI/UX e Estilização
- **Hierarquia Visual & Padrão de Leitura:** A interface foi desenhada respeitando o padrão ocidental de leitura (esquerda para direita, cima para baixo). Elementos críticos e botões de ação primária ("Salvar", "Login") foram estrategicamente posicionados para serem os primeiros elementos de interação percebidos ou seguirem o fluxo natural de encerramento de formulário.
- **PrimeFlex (Escolha Pragmática):** Optei pelo PrimeFlex pela produtividade e velocidade de desenvolvimento que ele oferece em um teste técnico. *Nota:* Reconheço que para projetos de médio/longo prazo, a recomendação atual seria o uso de Tailwind CSS ou CSS puro com Grid/Flexbox, visto que o PrimeFlex entrou em modo de manutenção.
- **SCSS Organizado:** Tentei estruturar o SCSS seguindo as convenções do Angular e PrimeNG, mantendo estilos globais em `styles/` e específicos nos componentes.
- **PrimeNG:** Utilizado para componentes ricos (Tabelas, Modais), customizados via Tokens de Design.

### 5. Boas Práticas de Roteamento
- **Lazy Loading:** Todas as rotas principais são carregadas sob demanda para performance inicial.
- **Auth Guards:** Proteção de rotas administrativas.
- **Resolvers:** Garantem que os dados críticos estejam disponíveis antes do componente ser renderizado, evitando "flickering" de tela vazia.

---

## ✅ Estratégia de Testes

A qualidade foi assegurada através de uma pirâmide de testes diversificada, cobrindo diferentes camadas da aplicação.

**Isolamento e Concorrência:** Um ponto de destaque é que os testes foram projetados para serem totalmente independentes (atômicos). Cada teste cria e destrói seu próprio cenário, garantindo que não haja vazamento de estado ou efeitos colaterais (side-effects) entre eles. Isso permite uma execução segura e livre de concorrência, facilitando a detecção de falhas reais.

| Camada | Ferramentas | Foco do Teste |
|:--- |:--- |:--- |
| **Fluxo Completo (E2E)** | **Cypress** | Simula o usuário real: Login -> Navegação -> Cadastro de Cliente -> Logout. Garante que o sistema funciona como um todo. |
| **UI + Interação** | **Karma & Jasmine** | Testa se os componentes renderizam, se os botões chamam as funções corretas e se o feedback visual aparece. |
| **Store (Estado)** | **Karma & Jasmine** | Valida a lógica de estado (Signals), garantindo que ações atualizem a store corretamente. |
| **Use Case (Regra)** | **Karma & Jasmine** | Testa as regras de negócio puras isoladas da interface e da infraestrutura. |

---

## 🚀 Como Executar Localmente

Preparei scripts para facilitar a execução tanto em Windows (PowerShell) quanto em Linux/Mac (Bash).

### Pré-requisitos
- **Docker** e **Docker Compose** instalados e rodando.

### Usando os Scripts de Automação
Na pasta `scripts/` você encontrará atalhos para as tarefas mais comuns.

#### 1. Iniciar o Projeto (Recomendado)
Este comando sobe o ambiente completo (Frontend + Mock Backend JSON Server) via Docker.
- **Windows:** `./scripts/powershell/start.ps1`
- **Linux/Mac:** `./scripts/bash/start.sh`

#### 2. Parar o Projeto
Derruba os containers e libera as portas.
- **Windows:** `./scripts/powershell/stop.ps1`
- **Linux/Mac:** `./scripts/bash/stop.sh`

#### 3. Executar Testes Unitários
Roda os testes de UI, Store e UseCases (Karma/Jasmine).
- **Windows:** `./scripts/powershell/test-unit.ps1`
- **Linux/Mac:** `./scripts/bash/test-unit.sh`

#### 4. Executar Testes E2E
Roda os testes de fluxo completo (Cypress). *O servidor deve estar rodando.*
- **Windows:** `./scripts/powershell/test-e2e.ps1`
- **Linux/Mac:** `./scripts/bash/test-e2e.sh`

#### 5. Limpeza Total
Remove containers, imagens criadas pelo projeto e volumes para garantir uma instalação limpa.
- **Windows:** `./scripts/powershell/full-remove.ps1`
- **Linux/Mac:** `./scripts/bash/full-remove.sh`

---

### Validação Manual (Passo a Passo)

Se preferir não usar os scripts, você pode executar manualmente:

1. **Subir a aplicação:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```
2. **Acessar:**
   - Frontend: [http://localhost:4200](http://localhost:4200)
   - API Mock: [http://localhost:3000](http://localhost:3000)
