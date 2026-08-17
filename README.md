# DIO Bank API — Node.js + TypeScript

## Descrição

API REST de um banco digital, desenvolvida em **Node.js** e **TypeScript** com **Express**. Permite criar usuários, gerenciar contas bancárias e realizar operações financeiras (depósito, saque e transferência), com validações, tratamento de erros centralizado e arquitetura em camadas. O projeto foi construído como evolução do desafio **"Criando a API do Dio Bank com Node"** da [Digital Innovation One](https://github.com/digitalinnovationone/desafio04-ts), e está preparado para deploy serverless na **Vercel**.

## Status

```text
Concluído
```

## Tecnologias

- Node.js
- TypeScript
- Express
- REST API
- bcryptjs (hash de senhas)
- Vitest + Supertest (testes automatizados)
- Vercel (deploy serverless)
- Git/GitHub

## Funcionalidades

**Usuários**
- Criar, listar, buscar por ID, atualizar e excluir usuários.
- Senha nunca é retornada nas respostas da API (é armazenada com hash via `bcryptjs`).
- Uma conta bancária é criada automaticamente para cada novo usuário.

**Contas**
- Consultar conta por ID.
- Consultar saldo.
- Listar histórico de transações da conta.

**Operações financeiras**
- Depósito, com validação de conta existente e valor positivo.
- Saque, com validação de saldo suficiente (saldo nunca fica negativo).
- Transferência entre contas, com validação de origem/destino existentes, diferentes entre si e saldo suficiente.

**Infraestrutura**
- Health check (`GET /health`) para validar o deploy.
- Middleware central de tratamento de erros, com respostas JSON padronizadas.
- Testes automatizados cobrindo as regras principais.
- Preparado para execução local e para deploy serverless na Vercel.

## Arquitetura

```text
src/
├── controllers/     # Recebem a requisição e delegam para os services
├── services/        # Regras de negócio e validações
├── repositories/     # Acesso aos dados (em memória, isolado para facilitar troca futura)
├── routes/           # Definição das rotas Express
├── middlewares/       # asyncHandler e tratamento central de erros
├── types/            # Interfaces de User, Account e Transaction
├── utils/            # AppError, geração de ID e validadores
└── app.ts            # Configuração do Express (sem app.listen)

src/server.ts          # Ponto de entrada para execução local (chama app.listen)
api/index.ts            # Ponto de entrada para a Vercel (exporta o Express app como handler)
tests/                  # Testes automatizados (Vitest + Supertest)
vercel.json              # Configuração de deploy na Vercel
```

A separação entre `src/app.ts` (configuração do Express) e `src/server.ts` (inicialização do servidor local) permite que o mesmo app seja reaproveitado tanto localmente quanto no handler serverless da Vercel (`api/index.ts`), sem depender de `app.listen()` em produção.

## Armazenamento de dados

Os dados (usuários, contas e transações) são mantidos **em memória**, organizados através de `repositories`. Essa camada isola o acesso aos dados para que, futuramente, seja simples substituir o armazenamento em memória por um banco de dados real (PostgreSQL, MongoDB, etc.) sem alterar controllers ou services.

>  **Importante:** em ambientes serverless (como a Vercel), cada invocação pode rodar em uma instância diferente da função, então os dados em memória **não são persistentes** entre requisições em produção. Esta versão do projeto não deve ser tratada como um banco de dados de produção real — é uma demonstração dos conceitos de API REST, TypeScript e arquitetura em camadas.

## Instalação

```bash
git clone https://github.com/SEU-USUARIO/dio-bank-api.git
cd dio-bank-api
npm install
```

## Desenvolvimento local

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000` (porta configurável pela variável de ambiente `PORT`).

## Build

```bash
npm run build
```

Compila o TypeScript para `dist/`. Para rodar o build compilado:

```bash
npm start
```

## Testes

```bash
npm test
```

Executa os testes automatizados (Vitest + Supertest), cobrindo: criação de usuário, e-mail duplicado, depósito, saque, saque sem saldo, transferência e transferência para conta inexistente.

## Endpoints

| Método    | Endpoint                     | Descrição                          |
| --------- | ----------------------------- | ----------------------------------- |
| GET       | /health                       | Health check                        |
| POST      | /users                        | Criar usuário (cria conta junto)    |
| GET       | /users                        | Listar usuários                     |
| GET       | /users/:id                    | Buscar usuário por ID               |
| PUT/PATCH | /users/:id                    | Atualizar usuário                   |
| DELETE    | /users/:id                    | Excluir usuário (e sua conta)       |
| GET       | /accounts/:id                 | Buscar conta por ID                 |
| GET       | /accounts/:id/balance         | Consultar saldo                     |
| GET       | /accounts/:id/transactions    | Listar transações da conta          |
| POST      | /accounts/:id/deposit         | Depósito                            |
| POST      | /accounts/:id/withdraw        | Saque                                |
| POST      | /accounts/:id/transfer        | Transferência para outra conta      |

## Exemplos

### Criar usuário

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

```json
{
  "user": {
    "id": "4c081461-fa35-46b2-bfd6-8042343ce5b6",
    "name": "Alice",
    "email": "alice@example.com",
    "createdAt": "2026-08-17T17:18:55.137Z"
  },
  "account": {
    "id": "629dd34d-6a2c-43a8-9287-1c9754e0124a",
    "userId": "4c081461-fa35-46b2-bfd6-8042343ce5b6",
    "balance": 0,
    "createdAt": "2026-08-17T17:18:55.137Z"
  }
}
```

### Depósito

```bash
curl -X POST http://localhost:3000/accounts/629dd34d-6a2c-43a8-9287-1c9754e0124a/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount":200}'
```

```json
{
  "id": "629dd34d-6a2c-43a8-9287-1c9754e0124a",
  "userId": "4c081461-fa35-46b2-bfd6-8042343ce5b6",
  "balance": 200,
  "createdAt": "2026-08-17T17:18:55.137Z"
}
```

### Saque

```bash
curl -X POST http://localhost:3000/accounts/629dd34d-6a2c-43a8-9287-1c9754e0124a/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amount":50}'
```

```json
{
  "id": "629dd34d-6a2c-43a8-9287-1c9754e0124a",
  "userId": "4c081461-fa35-46b2-bfd6-8042343ce5b6",
  "balance": 150,
  "createdAt": "2026-08-17T17:18:55.137Z"
}
```

### Transferência

```bash
curl -X POST http://localhost:3000/accounts/629dd34d-6a2c-43a8-9287-1c9754e0124a/transfer \
  -H "Content-Type: application/json" \
  -d '{"toAccountId":"140a0314-8d14-46d9-9797-082904f79941","amount":100}'
```

```json
{
  "from": { "id": "629dd34d-...", "balance": 50, "...": "..." },
  "to": { "id": "140a0314-...", "balance": 100, "...": "..." }
}
```

### Consultar saldo

```bash
curl http://localhost:3000/accounts/629dd34d-6a2c-43a8-9287-1c9754e0124a/balance
```

```json
{
  "accountId": "629dd34d-6a2c-43a8-9287-1c9754e0124a",
  "balance": 50
}
```

### Exemplo de erro padronizado

```json
{
  "error": "Saldo insuficiente para realizar o saque."
}
```

## Deploy na Vercel

1. Crie um repositório no GitHub e envie o projeto:
   ```bash
   git init
   git add .
   git commit -m "chore: initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/dio-bank-api.git
   git push -u origin main
   ```
2. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub.
3. Clique em **"Add New… → Project"** e importe o repositório recém-criado.
4. A Vercel detecta o `vercel.json` automaticamente — não é necessário configurar build command nem output directory (o framework preset pode ficar como "Other").
5. Clique em **Deploy**.
6. Após a conclusão, teste o endpoint de health check:
   ```text
   https://SEU-PROJETO.vercel.app/health
   ```
7. Os demais endpoints funcionam no mesmo domínio, por exemplo:
   ```text
   https://SEU-PROJETO.vercel.app/users
   https://SEU-PROJETO.vercel.app/accounts/:id/balance
   ```

## Projeto DIO

Este projeto foi desenvolvido a partir do desafio **"Criando a API do Dio Bank com Node"** da Digital Innovation One:
🔗 https://github.com/digitalinnovationone/desafio04-ts

O repositório oficial foi usado apenas como referência para compreender a proposta. A implementação aqui apresentada é própria, com arquitetura, validações e organização de código definidas de forma independente, incluindo melhorias que vão além do escopo original do desafio.

## Melhorias implementadas

- Arquitetura modular (controllers, services, repositories, routes, middlewares).
- Validações de entrada claras e centralizadas nos services.
- Middleware central de tratamento de erros com respostas JSON padronizadas.
- TypeScript com tipagem forte para `User`, `Account` e `Transaction` (sem `any`).
- Hash de senha com `bcryptjs` — a senha nunca é retornada pela API.
- Testes automatizados (Vitest + Supertest) cobrindo as regras principais.
- Endpoint de health check dedicado para validar o deploy.
- Separação entre app Express (`src/app.ts`) e entrada local (`src/server.ts`) vs. handler serverless (`api/index.ts`), compatível com a Vercel.
- Histórico de transações por conta (`GET /accounts/:id/transactions`).
- README completo com exemplos reais correspondentes à API implementada.
