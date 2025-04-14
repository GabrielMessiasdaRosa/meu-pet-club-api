import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Decorador que aplica as respostas comuns para endpoints autenticados
 * Adiciona respostas para 401 (Unauthorized) e 403 (Forbidden)
 */
export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Usuário não está autenticado',
      content: {
        'application/json': {
          example: {
            statusCode: 401,
            message: 'Unauthorized',
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Usuário não tem permissão para acessar este recurso',
      content: {
        'application/json': {
          example: {
            statusCode: 403,
            message: 'Forbidden resource',
          },
        },
      },
    }),
  );
}

/**
 * Decorador que aplica a resposta de Não Encontrado (404)
 * @param entity Nome da entidade que pode não ser encontrada
 * @param message Mensagem personalizada opcional
 */
export function ApiNotFoundResponse(entity: string, message?: string) {
  return ApiResponse({
    status: 404,
    description: `${entity} não encontrado`,
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: message || `${entity} não encontrado`,
        },
      },
    },
  });
}

/**
 * Decorador que aplica a resposta de Bad Request (400)
 * @param message Mensagem personalizada opcional
 */
export function ApiBadRequestResponse(message?: string) {
  return ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    content: {
      'application/json': {
        example: {
          statusCode: 400,
          message: message || ['campo1 é inválido', 'campo2 é obrigatório'],
          error: 'Bad Request',
        },
      },
    },
  });
}
