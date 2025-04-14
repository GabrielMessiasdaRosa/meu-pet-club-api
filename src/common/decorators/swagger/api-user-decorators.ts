import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequestResponse,
  ApiCommonResponses,
  ApiNotFoundResponse,
} from './api-common-responses.decorator';
import {
  createHateoasSchema,
  MessageResponseSchema,
  UserResponseSchema,
} from './api-schemas';

/**
 * Decorador para a operação de listar todos os usuários
 */
export function ApiListAllUsers() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar todos os usuários',
      description:
        'Retorna a lista completa de todos os usuários cadastrados no sistema',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de usuários recuperada com sucesso',
      schema: createHateoasSchema({
        type: 'array',
        items: { properties: UserResponseSchema.properties },
      }),
    }),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de obter dados do usuário atual
 */
export function ApiGetCurrentUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obter dados do usuário atual',
      description: 'Retorna os dados do usuário autenticado',
    }),
    ApiResponse({
      status: 200,
      description: 'Dados do usuário recuperados com sucesso',
      schema: createHateoasSchema(UserResponseSchema),
    }),
    ApiNotFoundResponse('Usuário'),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de buscar usuário por ID
 */
export function ApiGetUserById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Buscar usuário por ID',
      description:
        'Retorna os dados de um usuário específico pelo seu ID (apenas ADMIN e ROOT)',
    }),
    ApiParam({
      name: 'id',
      description: 'ID único do usuário',
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuário encontrado com sucesso',
      schema: createHateoasSchema(UserResponseSchema),
    }),
    ApiNotFoundResponse('Usuário'),
    ApiBadRequestResponse('ID inválido ou não fornecido'),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de atualizar dados do usuário atual
 */
export function ApiUpdateCurrentUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar dados do usuário atual',
      description:
        'Permite ao usuário autenticado atualizar seus próprios dados',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuário atualizado com sucesso',
      schema: createHateoasSchema(UserResponseSchema),
    }),
    ApiBadRequestResponse('Dados inválidos para atualização'),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de atualizar usuário por ID
 */
export function ApiUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar usuário por ID',
      description:
        'Atualiza os dados de um usuário específico pelo seu ID (apenas ADMIN e ROOT)',
    }),
    ApiParam({
      name: 'id',
      description: 'ID único do usuário',
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuário atualizado com sucesso',
      schema: createHateoasSchema(UserResponseSchema),
    }),
    ApiNotFoundResponse('Usuário'),
    ApiBadRequestResponse('Dados inválidos para atualização'),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de criar novo usuário
 */
export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar novo usuário',
      description: 'Cria um novo usuário no sistema (apenas ADMIN e ROOT)',
    }),
    ApiResponse({
      status: 201,
      description: 'Usuário criado com sucesso',
      schema: createHateoasSchema(UserResponseSchema),
    }),
    ApiResponse({
      status: 409,
      description: 'Email já está em uso',
      content: {
        'application/json': {
          example: {
            statusCode: 409,
            message: 'Email já está sendo utilizado',
            error: 'Conflict',
          },
        },
      },
    }),
    ApiBadRequestResponse('Dados inválidos para criação de usuário'),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de remover um usuário
 */
export function ApiDeleteUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Excluir usuário por ID',
      description:
        'Remove permanentemente um usuário do sistema pelo seu ID (apenas ADMIN e ROOT)',
    }),
    ApiParam({
      name: 'id',
      description: 'ID único do usuário',
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuário excluído com sucesso',
      schema: { properties: MessageResponseSchema.properties },
    }),
    ApiNotFoundResponse('Usuário'),
    ApiCommonResponses(),
  );
}
