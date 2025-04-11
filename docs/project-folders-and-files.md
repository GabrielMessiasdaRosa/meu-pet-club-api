## Estrutura de Pastas e Arquivos do Projeto

A estrutura de pastas e arquivos do projeto é organizada para facilitar a manutenção e a escalabilidade.

```plaintext
src/
├── main.ts # Ponto de entrada da aplicação
├── app.module.ts # Módulo principal
│
├──> common/ # Código compartilhado
│ ├──> decorators/
│ │ └── roles.decorator.ts # Decorador para definição de roles
│ ├──> enums/
│ │ └── role.enum.ts # Enum para ROOT, ADMIN e CLIENT
│ ├──> exceptions/
│ │ └── domain-exceptions.ts # Exceções de domínio personalizadas
│ ├──> guards/
│ │ ├── jwt-auth.guard.ts # Guard para autenticação JWT
│ │ └── roles.guard.ts # Guard para verificação de roles
│ └──> interfaces/ # Interfaces comuns
│
├──> config/ # Configurações
│ ├── mongodb.config.ts # Configuração do MongoDB
│ ├── jwt.config.ts # Configuração do JWT
│ └── app.config.ts # Outras configurações
│
├──> domain/ # Camada de domínio (core do negócio)
│ ├──> entities/ # Entidades de domínio
│ │ ├── user.entity.ts # Entidade de usuário (ADMIN/CLIENTE)
│ │ └── pet.entity.ts # Entidade de Pet
│ ├──> repositories/ # Interfaces de repositórios
│ │ ├── user.repository.interface.ts
│ │ └── pet.repository.interface.ts
│ ├──> value-objects/ # Objetos de valor
│ │ ├── email.value-object.ts
│ │ └── password.value-object.ts
│ └──> services/ # Serviços de domínio
│ ├── pet-ownership.service.ts # Serviço para gerenciar relação pet-usuário
│ └── user-role.service.ts # Serviço para gerenciar roles
│
├──> application/ # Camada de aplicação
│ ├──> dtos/ # Data Transfer Objects
│ │ ├──> auth/
│ │ │ ├── login.dto.ts
│ │ │ └── register.dto.ts
│ │ ├──> user/
│ │ │ ├── create-user.dto.ts
│ │ │ └── user-response.dto.ts
│ │ └──> pet/
│ │ ├── create-pet.dto.ts
│ │ └── pet-response.dto.ts
│ ├──> use-cases/ # Casos de uso
│ │ ├──> auth/
│ │ │ ├── login.use-case.ts
│ │ │ └── validate-token.use-case.ts
│ │ ├──> user/
│ │ │ ├── create-admin.use-case.ts
│ │ │ ├── create-client.use-case.ts
│ │ │ └── get-user.use-case.ts
│ │ └──> pet/
│ │ ├── create-pet.use-case.ts
│ │ ├── update-pet.use-case.ts
│ │ ├── delete-pet.use-case.ts
│ │ └── get-pet.use-case.ts
│ └──> mappers/ # Mapeadores entre domain e dto
│   ├── user.mapper.ts
│   └── pet.mapper.ts
│
├──> infrastructure/ # Camada de infraestrutura
│ ├──> database/
│ │ ├──> mongodb/
│ │ │ ├──> schemas/ # Esquemas do MongoDB
│ │ │ │ ├── user.schema.ts
│ │ │ │ └── pet.schema.ts
│ │ │ └──> repositories/ # Implementações de repositórios
│ │ │ ├── user.repository.ts
│ │ │ └── pet.repository.ts
│ │ └── database.module.ts # Módulo de banco de dados
│ ├──> auth/ # Infraestrutura de autenticação
│ │ ├──> strategies/
│ │ │ └── jwt.strategy.ts # Estratégia JWT
│ │ └── auth.service.ts # Serviço de autenticação
│ └──> tp-services/ # Implementações de serviços terceiros
│
└──> interface/ # Camada de interface
    ├──> http/ # Interface HTTP/REST
    │   ├──> controllers/ # Controllers
    │   │   ├── auth.controller.ts
    │   │   ├── user.controller.ts
    │   │   └── pet.controller.ts
    │   └──> presenters/ # Formatadores de resposta
    │       ├── user.presenter.ts
    │       └── pet.presenter.ts
    └──> modules/ # Módulos NestJS
            ├── auth.module.ts # Módulo de autenticação
            ├── user.module.ts # Módulo de usuários
            └── pet.module.ts # Módulo de pets
```
