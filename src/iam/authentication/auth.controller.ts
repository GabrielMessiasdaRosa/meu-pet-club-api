import {
  AuthMessageResponse,
  AuthPresenter,
  SignInResponse,
} from '@/interface/server/presenters/auth.presenter';
import { HateoasResource } from '@/interface/server/presenters/hateoas-resource.presenter';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ActiveUser } from '../decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthType } from './enums/auth-type.enum';

@ApiTags('auth')
@Auth(AuthType.Public)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Encerrar sessão do usuário',
    description:
      'Invalida o token de acesso atual do usuário e o remove das sessões ativas',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token de acesso JWT',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessão encerrada com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            message: {
              type: 'string',
              example: 'Sessão encerrada com sucesso',
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso não fornecido ou inválido',
  })
  @Auth(AuthType.Private)
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signOut(
    @ActiveUser() user: ActiveUserData,
    @Req() request: Request,
  ): Promise<HateoasResource<AuthMessageResponse>> {
    const userId = user.sub;
    const accessToken = request.headers['authorization'];

    if (!accessToken) {
      throw new UnauthorizedException('Access token not provided');
    }

    await this.authService.signOut(userId, accessToken.split(' ')[1]);
    return AuthPresenter.toHateoasSignOut();
  }

  @ApiOperation({
    summary: 'Solicitar redefinição de senha',
    description:
      'Envia um email com instruções para redefinição de senha do usuário',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email de redefinição enviado com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            message: {
              type: 'string',
              example: 'Email de recuperação de senha enviado.',
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email não encontrado ou inválido',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
      },
    },
    description: 'Dados para solicitar redefinição de senha',
  })
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() { email }: RequestPasswordResetDto,
  ): Promise<HateoasResource<AuthMessageResponse>> {
    const payload: RequestPasswordResetDto = { email };
    const result = await this.authService.requestPasswordReset(payload);
    return AuthPresenter.toHateoasPasswordResetRequest(result.message);
  }

  @ApiOperation({
    summary: 'Redefinir senha',
    description:
      'Redefine a senha do usuário usando o token recebido por email',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Senha redefinida com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            message: { type: 'string', example: 'A senha sua foi alterada.' },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Token inválido ou expirado',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'newPassword', 'resetToken'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
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
  })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<HateoasResource<AuthMessageResponse>> {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return AuthPresenter.toHateoasPasswordReset(result.message);
  }

  @ApiOperation({
    summary: 'Cadastrar usuário',
    description: 'Cria uma nova conta de usuário no sistema',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            message: { type: 'string', example: 'User created successfully' },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email já cadastrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'password', 'role'],
      properties: {
        name: { type: 'string', example: 'User Name' },
        email: { type: 'string', format: 'email', example: 'user@example.com' },
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
  })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signUpDto: SignUpDto,
  ): Promise<HateoasResource<AuthMessageResponse>> {
    const result = await this.authService.signUp(signUpDto);
    return AuthPresenter.toHateoasSignUp(result.message);
  }

  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Autentica um usuário e retorna tokens de acesso',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Autenticação realizada com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        password: {
          type: 'string',
          format: 'password',
          example: 'securePassword123',
        },
      },
    },
    description: 'Credenciais para login',
  })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(
    @Res({
      passthrough: true,
    })
    response: Response,
    @Body() signInDto: SignInDto,
  ): Promise<HateoasResource<SignInResponse>> {
    const authResult = await this.authService.signIn(signInDto);

    response.cookie('accessToken', authResult.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    return AuthPresenter.toHateoasSignIn(authResult);
  }

  @ApiOperation({
    summary: 'Renovar tokens',
    description: 'Gera um novo token de acesso usando o refresh token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens renovados com sucesso',
    type: HateoasResource,
    schema: {
      properties: {
        data: {
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' },
              },
            },
          },
        },
        links: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              href: { type: 'string' },
              rel: { type: 'string' },
              method: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token inválido ou expirado',
  })
  @ApiBody({
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
  })
  @ApiBearerAuth()
  @Auth(AuthType.Private)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<HateoasResource<SignInResponse>> {
    const accessToken = request.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Access token not provided');
    }

    const result = await this.authService.refreshTokens(
      refreshTokenDto,
      accessToken,
    );
    return AuthPresenter.toHateoasRefreshTokens(result);
  }
}
