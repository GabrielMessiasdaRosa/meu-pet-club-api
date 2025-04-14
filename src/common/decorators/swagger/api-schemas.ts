/**
 * Esquemas reutilizáveis para documentação Swagger
 * Centraliza definições de esquemas comuns para evitar duplicação
 */

/**
 * Esquema padrão para links HATEOAS
 */
export const HateoasLinksSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      href: { type: 'string' },
      rel: { type: 'string' },
      method: { type: 'string' },
    },
  },
};

/**
 * Esquema base para respostas HATEOAS
 * @param dataSchema Esquema para o campo data da resposta
 */
export function createHateoasSchema(dataSchema: any) {
  return {
    properties: {
      data: dataSchema,
      links: HateoasLinksSchema,
    },
  };
}

/**
 * Esquema de resposta para usuário sem senha
 */
export const UserResponseSchema = {
  properties: {
    id: {
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440000',
    },
    name: { type: 'string', example: 'João Silva' },
    email: { type: 'string', example: 'joao.silva@exemplo.com' },
    role: {
      type: 'string',
      enum: ['USER', 'ADMIN', 'ROOT'],
      example: 'USER',
    },
  },
};

/**
 * Esquema de resposta para pets
 */
export const PetResponseSchema = {
  properties: {
    id: {
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440000',
    },
    name: { type: 'string', example: 'Rex' },
    type: { type: 'string', example: 'Cachorro' },
    breed: { type: 'string', example: 'Golden Retriever' },
    age: { type: 'number', example: 3 },
    userId: {
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440002',
    },
  },
};

/**
 * Esquema para mensagens simples
 */
export const MessageResponseSchema = {
  properties: {
    message: { type: 'string', example: 'Operação realizada com sucesso' },
  },
};

/**
 * Esquema para resposta de autenticação
 */
export const AuthResponseSchema = {
  properties: {
    accessToken: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    refreshToken: {
      type: 'string',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    user: UserResponseSchema,
  },
};
