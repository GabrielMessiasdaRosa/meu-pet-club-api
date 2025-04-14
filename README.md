# Meu Pet Club API

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![SonarQube](https://img.shields.io/badge/SonarQube-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)

API de gerenciamento de usuários e pets desenvolvida com NestJS, MongoDB e Redis, seguindo os princípios da Arquitetura Limpa (Clean Architecture).

## 📋 Índice

- [🚀 Como Executar o Projeto](#-como-executar-o-projeto)
- [🔗 URLs Disponíveis](#-urls-disponíveis)
- [👁️ Visão Geral](#️-visão-geral)
- [🏗️ Arquitetura](#️-arquitetura)
- [✨ Funcionalidades](#-funcionalidades)
- [📝 Entidades](#-entidades)
- [🔐 Autenticação e Autorização](#-autenticação-e-autorização)
- [🛣️ Endpoints da API](#️-endpoints-da-api)
- [🧪 Testes](#-testes)
- [👨‍💻 Desenvolvimento](#-desenvolvimento)
- [🛠️ Tecnologias Utilizadas](#️-tecnologias-utilizadas)

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Docker e Docker Compose
- Node.js e npm (opcional para desenvolvimento local)

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Ambiente
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://root:example@localhost:27017/meu-pet-club?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=example

# JWT
JWT_SECRET=your-secret-key
JWT_TOKEN_AUDIENCE=your-audience
JWT_TOKEN_ISSUER=your-issuer
JWT_ACCESS_TOKEN_TTL=3600
JWT_REFRESH_TOKEN_TTL=86400

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASSWORD=sua-senha-de-app
EMAIL_FROM=Meu Pet Club <no-reply@meupetclub.com>
```

> Nota: Ao usar Docker Compose, substitua `localhost` por `mongo` e `redis` respectivamente.

### Usando Docker Compose

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/meu-pet-club-api.git
   cd meu-pet-club-api
   ```

2. Crie o arquivo `.env` conforme instruções acima.

3. Execute o projeto com Docker Compose:

   ```bash
   docker-compose up
   ```

4. A API estará disponível em: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)

### Para desenvolvimento local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Execute o MongoDB e Redis via Docker Compose:

   ```bash
   docker-compose up mongo redis
   ```

3. Inicie a aplicação em modo de desenvolvimento:
   ```bash
   npm run start:dev
   ```

## 🔗 URLs Disponíveis

- **API Base**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1)
- **Documentação da API (Swagger)**: [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)
- **MongoDB Express** (Gerenciador de BD): [http://localhost:8081](http://localhost:8081)
- **Redis Commander** (Gerenciador de Redis): [http://localhost:8082](http://localhost:8082)

## 👁️ Visão Geral

Este projeto foi desenvolvido como parte de um teste técnico para a empresa Meu Pet Club. Trata-se de uma API de gerenciamento de usuários e seus pets, projetada para demonstrar habilidades de desenvolvimento com NestJS, MongoDB, Redis e padrões arquiteturais modernos.

O sistema implementa controle de acesso baseado em roles (RBAC) com três níveis de permissão:

- **USER**: Clientes comuns que podem gerenciar seus próprios dados e pets
- **ADMIN**: Administradores com acesso a dados de usuários e pets
- **ROOT**: Privilégios máximos para gerenciar todo o sistema

## 🏗️ Arquitetura

O projeto foi desenvolvido seguindo os princípios da Arquitetura Limpa (Clean Architecture), com separação clara entre camadas:

1. **Domain**: O núcleo da aplicação, contendo entidades e regras de negócio

   - Entidades (User, Pet)
   - Interfaces de repositórios
   - Regras de negócio e validações

2. **Application**: Casos de uso e lógica da aplicação

   - DTOs para transferência de dados
   - Serviços de aplicação
   - Mapeadores

3. **Infrastructure**: Implementações concretas de serviços e repositórios

   - Repositórios MongoDB
   - Implementação de autenticação
   - Serviços de email e cache

4. **Interface**: Controllers e apresentação dos dados
   - Controllers REST
   - Presenters (formatadores de resposta)
   - Módulos NestJS

### Estrutura de pastas

```
src/
├── main.ts                  # Ponto de entrada da aplicação
├── app.module.ts            # Módulo principal
├── application/             # Camada de aplicação
│   ├── dtos/                # Data Transfer Objects
│   └── services/            # Serviços de aplicação
├── common/                  # Utilitários compartilhados
├── config/                  # Configurações da aplicação
├── domain/                  # Camada de domínio
│   ├── entities/            # Entidades do sistema
│   └── repositories/        # Interfaces de repositórios
├── iam/                     # Identity and Access Management
│   ├── authentication/      # Autenticação
│   ├── authorization/       # Autorização
│   ├── hashing/             # Serviços de hash
│   └── redis/               # Armazenamento em Redis
├── infra/                   # Camada de infraestrutura
│   ├── database/            # Implementações de banco de dados
│   ├── email/               # Serviço de e-mail
│   └── mappers/             # Mapeadores
└── interface/               # Camada de interface
    ├── modules/             # Módulos NestJS
    └── server/              # Controladores e presenters
```

## ✨ Funcionalidades

- **Autenticação completa**:

  - Login/Signin com email e senha
  - Registro/Signup de novos usuários
  - Logout/Signout com invalidação de token
  - Refresh token para renovação da sessão
  - Recuperação de senha via email

- **Controle de acesso** baseado em roles (RBAC)

  - Diferentes permissões por tipo de usuário
  - Guards de segurança para proteção de rotas

- **Gestão de usuários**:

  - Criação, atualização e remoção
  - Busca por ID e listagem
  - Permissões hierárquicas

- **Gestão de pets**:

  - CRUD completo (Criar, Ler, Atualizar, Deletar)
  - Associação com usuários
  - Busca por proprietário

- **API RESTful**:
  - Padrão HATEOAS para navegabilidade
  - Documentação Swagger/OpenAPI
  - Validação de dados com class-validator

## 📝 Entidades

### Usuário (User)

Representa um usuário do sistema:

| Campo             | Tipo   | Descrição                                  |
| ----------------- | ------ | ------------------------------------------ |
| id                | UUID   | Identificador único                        |
| name              | string | Nome completo                              |
| email             | string | E-mail único para acesso                   |
| password          | string | Senha (armazenada com hash)                |
| role              | enum   | Papel (USER, ADMIN ou ROOT)                |
| resetToken        | string | Token para redefinição de senha (opcional) |
| resetTokenExpires | Date   | Data de expiração do token (opcional)      |

### Pet

Representa um animal de estimação associado a um usuário:

| Campo  | Tipo   | Descrição                               |
| ------ | ------ | --------------------------------------- |
| id     | UUID   | Identificador único                     |
| name   | string | Nome do pet                             |
| type   | string | Tipo de animal (ex: "Cachorro", "Gato") |
| breed  | string | Raça (opcional)                         |
| age    | number | Idade em anos (opcional)                |
| userId | UUID   | ID do usuário proprietário              |

## 🔐 Autenticação e Autorização

O sistema utiliza autenticação baseada em tokens JWT com os seguintes recursos:

### Fluxo de autenticação

1. **Login**: O usuário fornece email e senha e recebe um access token e refresh token
2. **Acesso a recursos**: O access token é usado para acessar recursos protegidos
3. **Renovação**: Quando o access token expira, o refresh token pode ser usado para obter um novo par de tokens
4. **Logout**: O refresh token é invalidado no Redis para impedir seu uso futuro

### Controle de acesso (RBAC)

O sistema implementa um controle de acesso baseado em papéis:

| Papel | Permissões                                         |
| ----- | -------------------------------------------------- |
| USER  | Gerenciar apenas seus próprios dados e pets        |
| ADMIN | Gerenciar dados de qualquer usuário e pet          |
| ROOT  | Acesso total, incluindo criar outros usuários ROOT |

## 🛣️ Endpoints da API

### Autenticação

| Método | Endpoint                     | Descrição                      | Acesso      |
| ------ | ---------------------------- | ------------------------------ | ----------- |
| POST   | /auth/signin                 | Autenticar usuário             | Público     |
| POST   | /auth/signup                 | Cadastrar novo usuário         | Público     |
| POST   | /auth/signout                | Encerrar sessão                | Autenticado |
| POST   | /auth/refresh-tokens         | Renovar tokens                 | Autenticado |
| POST   | /auth/request-password-reset | Solicitar redefinição de senha | Público     |
| POST   | /auth/reset-password         | Redefinir senha                | Público     |

### Usuários

| Método | Endpoint   | Descrição                        | Acesso      |
| ------ | ---------- | -------------------------------- | ----------- |
| GET    | /users     | Listar todos os usuários         | ADMIN, ROOT |
| GET    | /users/me  | Obter dados do usuário atual     | Autenticado |
| GET    | /users/:id | Buscar usuário por ID            | ADMIN, ROOT |
| POST   | /users     | Criar novo usuário               | ADMIN, ROOT |
| PATCH  | /users/me  | Atualizar dados do usuário atual | Autenticado |
| PATCH  | /users/:id | Atualizar usuário por ID         | ADMIN, ROOT |
| DELETE | /users/:id | Excluir usuário                  | ADMIN, ROOT |

### Pets

| Método | Endpoint      | Descrição                    | Acesso                    |
| ------ | ------------- | ---------------------------- | ------------------------- |
| GET    | /pets         | Listar todos os pets         | ADMIN, ROOT               |
| GET    | /pets/my-pets | Listar pets do usuário atual | Autenticado               |
| GET    | /pets/:id     | Buscar pet por ID            | Proprietário, ADMIN, ROOT |
| POST   | /pets         | Criar novo pet               | USER                      |
| PATCH  | /pets/:id     | Atualizar pet                | Proprietário, ADMIN, ROOT |
| DELETE | /pets/:id     | Excluir pet                  | Proprietário, ADMIN, ROOT |

## 🧪 Testes

O projeto inclui testes unitários e de integração para garantir a qualidade do código:

### Executando testes

```bash
# Testes unitários
npm test

# Testes com watch mode
npm run test:watch

# Testes com cobertura
npm run test:cov

# Testes end-to-end
npm run test:e2e
```

## 👨‍💻 Desenvolvimento

### Scripts disponíveis

```bash
# Iniciar servidor de desenvolvimento
npm run start:dev

# Formatar código
npm run format

# Verificar lint
npm run lint

# Compilar projeto
npm run build

# Iniciar em produção
npm run start:prod
```

### Boas práticas de desenvolvimento

- Mantenha a arquitetura limpa respeitando a separação de camadas
- Escreva testes para novas funcionalidades
- Siga o estilo de código com o linter configurado
- Documente novos endpoints usando os decoradores Swagger

## 🛠️ Tecnologias Utilizadas

- **NestJS**: Framework Node.js para aplicações escaláveis
- **MongoDB**: Banco de dados NoSQL
- **Mongoose**: ODM para MongoDB
- **Redis**: Cache e armazenamento de tokens
- **JWT**: Tokens de autenticação
- **Swagger/OpenAPI**: Documentação da API
- **Jest**: Framework de testes
- **Docker/Docker Compose**: Containerização
- **Bcrypt**: Hashing de senhas
- **NodeMailer**: Envio de emails
- **TypeScript**: Linguagem de programação tipada
- **Class Validator**: Validação de dados

---

Desenvolvido como parte do desafio técnico Meu Pet Club.
