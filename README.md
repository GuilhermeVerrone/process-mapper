# Case: Aplicação de Mapeamento de Processos

Esta é uma aplicação Full Stack desenvolvida como um case para mapeamento de processos de negócio. A aplicação permite que usuários visualizem e gerenciem áreas e processos de uma organização de forma hierárquica e visual.

## Arquitetura

```
+------------------+      +---------------------+      +-----------------+
|   Frontend       |      |      Backend        |      |   Database      |
| (React / Vite)   |      | (Node.js / Express) |      |    (MySQL)      |
| - React Flow     |      | - Prisma ORM        |      |                 |
| - Redux Toolkit  |----->| - JWT Auth          |----->| - Docker        |
| - Material UI    |      | - Zod Validation    |      |                 |
| - Axios          |      | - Vitest            |      |                 |
+------------------+      +---------------------+      +-----------------+
```

## Stack Utilizada

- **Front-end:** React, Vite, TypeScript, React Flow, Redux Toolkit, Material UI, Axios.
- **Back-end:** Node.js, Express, TypeScript, Prisma ORM, MySQL.
- **Ferramentas:** Git, Docker, npm, Vitest.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose

## 🚀 Como Rodar o Projeto Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/GuilhermeVerrone/process-mapper
    cd process-mapper
    ```

2.  **Inicie o Banco de Dados com Docker:**
    Na pasta raiz do projeto, suba o container do MySQL:
    ```bash
    docker-compose up -d
    ```

3.  **Configure e Rode o Back-end:**
    Navegue até a pasta do servidor, instale as dependências e rode as migrações do banco.
    ```bash
    cd server
    npm install
    npx prisma migrate dev --name init
    npm run prisma:seed # Opcional: para popular o banco com dados de exemplo
    npm run dev
    ```
    O servidor back-end estará rodando em `http://localhost:3333`.

4.  **Configure e Rode o Front-end:**
    Em **outro terminal**, navegue até a pasta do cliente, instale as dependências e inicie a aplicação.
    ```bash
    cd client
    npm install
    npm run dev
    ```
    A aplicação front-end estará disponível em `http://localhost:5173`.

## Credenciais de Teste

Após rodar o `seed`, você pode usar as seguintes credenciais para fazer login:
- **Email:** `admin@example.com`
- **Senha:** `123456`

## Endpoints da API (Exemplos)

- `POST /login`: Autentica um usuário e retorna um token JWT.
- `GET /areas`: Retorna todas as áreas (requer autenticação).
- `GET /processes?areaId=...`: Retorna todos os processos de uma área (requer autenticação).
- `PATCH /processes/:id/position`: Atualiza a posição X/Y de um nó no gráfico (requer autenticação).

---