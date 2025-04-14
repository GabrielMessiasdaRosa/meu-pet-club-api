import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiBadRequestResponse } from './api-common-responses.decorator';
import {
  AuthResponseSchema,
  MessageResponseSchema,
  createHateoasSchema,
} from './api-schemas';

/**
 * Decorador para a operação de login (signin)
 */
export function ApiSignIn() {
  return applyDecorators(
    ApiOperation({
      summary: 'Autenticar usuário',
      description: 'Autentica um usuário e retorna tokens de acesso',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'securePassword123',
          },
        },
      },
      description: 'Credenciais para login',
    }),
    ApiResponse({
      status: 200,
      description: 'Autenticação realizada com sucesso',
      schema: createHateoasSchema(AuthResponseSchema),
    }),
    ApiResponse({
      status: 401,
      description: 'Credenciais inválidas',
      content: {
        'application/json': {
          example: {
            statusCode: 401,
            message: 'Email ou senha inválidos',
            error: 'Unauthorized',
          },
        },
      },
    }),
  );
}

/**
 * Decorador para a operação de cadastro (signup)
 */
export function ApiSignUp() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cadastrar usuário',
      description: 'Cria uma nova conta de usuário no sistema',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['name', 'email', 'password', 'role'],
        properties: {
          name: { type: 'string', example: 'User Name' },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'securePassword123',
          },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN', 'ROOT'],
            example: 'USER',
          },
        },
      },
      description: 'Dados para cadastro de usuário',
    }),
    ApiResponse({
      status: 201,
      description: 'Usuário criado com sucesso',
      schema: createHateoasSchema(MessageResponseSchema),
    }),
    ApiResponse({
      status: 409,
      description: 'Email já cadastrado',
    }),
    ApiBadRequestResponse(),
    ApiResponse({
      status: 403,
      description: 'Permissão negada para criar usuário ROOT',
    }),
  );
}

/**
 * Decorador para a operação de logout (signout)
 */
export function ApiSignOut() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Encerrar sessão do usuário',
      description:
        'Invalida o token de acesso atual do usuário e o remove das sessões ativas',
    }),
    ApiHeader({
      name: 'Authorization',
      description: 'Bearer token de acesso JWT',
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: 'Sessão encerrada com sucesso',
      schema: createHateoasSchema(MessageResponseSchema),
    }),
    ApiResponse({
      status: 401,
      description: 'Token de acesso não fornecido ou inválido',
    }),
  );
}

/**
 * Decorador para a operação de renovação de tokens (refresh tokens)
 */
export function ApiRefreshTokens() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Renovar tokens',
      description: 'Gera um novo token de acesso usando o refresh token',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
      },
      description: 'Refresh token para renovação',
    }),
    ApiResponse({
      status: 200,
      description: 'Tokens renovados com sucesso',
      schema: createHateoasSchema(AuthResponseSchema),
    }),
    ApiResponse({
      status: 401,
      description: 'Refresh token inválido ou expirado',
    }),
  );
}

/**
 * Decorador para a operação de solicitar redefinição de senha
 */
export function ApiRequestPasswordReset() {
  return applyDecorators(
    ApiOperation({
      summary: 'Solicitar redefinição de senha',
      description:
        'Envia um email com instruções para redefinição de senha do usuário',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
        },
      },
      description: 'Dados para solicitar redefinição de senha',
    }),
    ApiResponse({
      status: 200,
      description: 'Email de redefinição enviado com sucesso',
      schema: createHateoasSchema(MessageResponseSchema),
    }),
    ApiBadRequestResponse('Email não encontrado ou inválido'),
  );
}

/**
 * Decorador para a operação de redefinir senha
 */
export function ApiResetPassword() {
  return applyDecorators(
    ApiOperation({
      summary: 'Redefinir senha',
      description:
        'Redefine a senha do usuário usando o token recebido por email',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['email', 'newPassword', 'resetToken'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com',
          },
          newPassword: {
            type: 'string',
            format: 'password',
            example: 'newSecurePassword123',
          },
          resetToken: {
            type: 'string',
            format: 'uuid',
            example: 'a0b1c2d3-e4f5-6789-abcd-ef0123456789',
          },
        },
      },
      description: 'Dados para redefinição de senha',
    }),
    ApiResponse({
      status: 200,
      description: 'Senha redefinida com sucesso',
      schema: createHateoasSchema(MessageResponseSchema),
    }),
    ApiBadRequestResponse('Token inválido ou expirado'),
  );
}
