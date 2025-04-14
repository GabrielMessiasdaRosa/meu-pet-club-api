# Meu Pet Club API

API de gerenciamento de usuários e pets desenvolvida com NestJS, MongoDB e Redis.

## Índice

- [Como Executar o Projeto](#como-executar-o-projeto)
- [URLs Disponíveis](#urls-disponíveis)
- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Entidades](#entidades)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Endpoints da API](#endpoints-da-api)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)

## Como Executar o Projeto

### Pré-requisitos

- Docker e Docker Compose
- Node.js (opcional para desenvolvimento local)

### Usando Docker Compose

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/meu-pet-club-api.git
   cd meu-pet-club-api
   ```

2. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis (ou ajuste conforme necessário):

   ```
   # API
   PORT=3000

   # MongoDB
   MONGO_URI=mongodb://root:example@mongo:27017/meu-pet-club?authSource=admin

   # Redis
   REDIS_HOST=redis
   REDIS_PORT=6379
   REDIS_PASSWORD=example

   # JWT
   JWT_SECRET=seu_segredo_jwt_aqui
   JWT_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=seu_segredo_refresh_aqui
   JWT_REFRESH_EXPIRES_IN=7d
   ```

3. Execute o projeto com Docker Compose:

   ```bash
   docker-compose up
   ```

4. A API estará disponível em: [http://localhost:3000](http://localhost:3000)

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

## URLs Disponíveis

- **API**: [http://localhost:3000](http://localhost:3000)
- **Documentação da API (Swagger)**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **MongoDB Express** (Gerenciador de BD): [http://localhost:8081](http://localhost:8081)
- **Redis Commander** (Gerenciador de Redis): [http://localhost:8082](http://localhost:8082)

## Visão Geral

O Meu Pet Club API é um sistema de gerenciamento para pet shops ou clínicas veterinárias, permitindo o cadastro de usuários e seus pets. O sistema implementa controle de acesso baseado em roles (RBAC) com três níveis de permissão:

- **USER**: Clientes comuns que podem gerenciar seus próprios dados e pets
- **ADMIN**: Administradores com acesso a dados de usuários e pets
- **ROOT**: Privilégios máximos para gerenciar todo o sistema

## Arquitetura

O projeto foi desenvolvido seguindo os princípios da Arquitetura Limpa (Clean Architecture), com separação clara entre camadas:

1. **Domain**: O núcleo da aplicação, contendo entidades e regras de negócio
2. **Application**: Casos de uso e lógica da aplicação
3. **Infrastructure**: Implementações concretas como banco de dados e serviços externos
4. **Interface**: Controllers e apresentação dos dados

## Funcionalidades

- Autenticação e autorização com JWT
- Gestão de usuários com diferentes níveis de acesso (RBAC)
- Cadastro e gerenciamento de pets
- Recuperação de senha por e-mail
- Resposta HATEOAS para melhor experiência de API
- Documentação automática com Swagger

## Entidades

### Usuário (User)

Representa um usuário do sistema, com os seguintes atributos:

- **id**: Identificador único (UUID)
- **name**: Nome completo
- **email**: E-mail único para acesso
- **password**: Senha (armazenada com hash)
- **role**: Papel do usuário (USER, ADMIN ou ROOT)
- **resetToken**: Token para redefinição de senha (opcional)
- **resetTokenExpires**: Data de expiração do token (opcional)

### Pet

Representa um animal de estimação associado a um usuário, com os atributos:

- **id**: Identificador único (UUID)
- **name**: Nome do pet
- **type**: Tipo de animal (ex: "Cachorro", "Gato", etc.)
- **breed**: Raça (opcional)
- **age**: Idade em anos (opcional)
- **userId**: ID do usuário proprietário

## Autenticação e Autorização

O sistema utiliza autenticação baseada em tokens JWT com os seguintes recursos:

- Login/Signin com email e senha
- Registro/Signup de novos usuários
- Logout/Signout com invalidação de token
- Refresh token para renovação da sessão
- Recuperação de senha via email
- Autorização baseada em roles (RBAC)

## Endpoints da API

### Autenticação

- **POST /auth/signin**: Autenticar usuário
- **POST /auth/signup**: Cadastrar novo usuário
- **POST /auth/signout**: Encerrar sessão
- **POST /auth/refresh-tokens**: Renovar tokens
- **POST /auth/request-password-reset**: Solicitar redefinição de senha
- **POST /auth/reset-password**: Redefinir senha

### Usuários

- **GET /users**: Listar todos os usuários (ADMIN/ROOT)
- **GET /users/me**: Obter dados do usuário atual
- **GET /users/:id**: Buscar usuário por ID (ADMIN/ROOT)
- **POST /users**: Criar novo usuário (ADMIN/ROOT)
- **PATCH /users/me**: Atualizar dados do usuário atual
- **PATCH /users/:id**: Atualizar usuário por ID (ADMIN/ROOT)
- **DELETE /users/:id**: Excluir usuário (ADMIN/ROOT)

### Pets

- **GET /pets**: Listar todos os pets (ADMIN/ROOT)
- **GET /pets/my-pets**: Listar pets do usuário atual
- **GET /pets/:id**: Buscar pet por ID
- **POST /pets**: Criar novo pet (USER)
- **PATCH /pets/:id**: Atualizar pet
- **DELETE /pets/:id**: Excluir pet

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js para criação de aplicações escaláveis
- **MongoDB**: Banco de dados NoSQL para armazenamento de dados
- **Mongoose**: ODM para MongoDB
- **Redis**: Cache e armazenamento de sessões/tokens
- **JWT**: Geração e validação de tokens de autenticação
- **Swagger/OpenAPI**: Documentação da API
- **Jest**: Framework de testes
- **Docker/Docker Compose**: Containerização e orquestração
- **Bcrypt**: Hashing de senhas
- **NodeMailer**: Envio de emails para recuperação de senha
