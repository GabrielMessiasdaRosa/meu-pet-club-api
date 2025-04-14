import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  ApiBadRequestResponse,
  ApiCommonResponses,
  ApiNotFoundResponse,
} from './api-common-responses.decorator';
import { createHateoasSchema, PetResponseSchema } from './api-schemas';

/**
 * Decorador para a operação de buscar pet por ID
 */
export function ApiGetPetById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obter pet por ID',
      description: 'Retorna os detalhes de um pet específico pelo seu ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID único do pet',
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Pet encontrado com sucesso',
      schema: createHateoasSchema(PetResponseSchema),
    }),
    ApiNotFoundResponse('Pet'),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de listar todos os pets
 */
export function ApiListAllPets() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar todos os pets',
      description:
        'Retorna a lista completa de todos os pets cadastrados no sistema. Apenas administradores e ROOT podem ver todos os pets.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de pets recuperada com sucesso',
      schema: createHateoasSchema({
        type: 'array',
        items: { properties: PetResponseSchema.properties },
      }),
    }),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de listar meus pets
 */
export function ApiListMyPets() {
  return applyDecorators(
    ApiOperation({
      summary: 'Listar meus pets',
      description:
        'Retorna a lista de todos os pets associados ao usuário autenticado.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de pets do usuário recuperada com sucesso',
      schema: createHateoasSchema({
        type: 'array',
        items: { properties: PetResponseSchema.properties },
      }),
    }),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de criar um pet
 */
export function ApiCreatePet() {
  return applyDecorators(
    ApiOperation({
      summary: 'Criar um novo pet',
      description:
        'Cria um novo pet associado ao usuário autenticado. Apenas CLIENTES podem criar pets.',
    }),
    ApiResponse({
      status: 201,
      description: 'Pet criado com sucesso',
      schema: createHateoasSchema(PetResponseSchema),
    }),
    ApiBadRequestResponse(),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de atualizar um pet
 */
export function ApiUpdatePet() {
  return applyDecorators(
    ApiOperation({
      summary: 'Atualizar pet por ID',
      description:
        'Atualiza os detalhes de um pet específico pelo seu ID. Apenas o dono do pet ou administradores podem atualizar.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID único do pet',
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 200,
      description: 'Pet atualizado com sucesso',
      schema: createHateoasSchema(PetResponseSchema),
    }),
    ApiNotFoundResponse('Pet'),
    ApiBadRequestResponse(),
    ApiCommonResponses(),
  );
}

/**
 * Decorador para a operação de remover um pet
 */
export function ApiDeletePet() {
  return applyDecorators(
    ApiOperation({
      summary: 'Excluir pet por ID',
      description:
        'Remove permanentemente um pet do sistema pelo seu ID. Apenas o dono do pet ou administradores podem deletar.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID único do pet',
      type: 'string',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    ApiResponse({
      status: 204,
      description: 'Pet excluído com sucesso',
    }),
    ApiNotFoundResponse('Pet'),
    ApiCommonResponses(),
  );
}
