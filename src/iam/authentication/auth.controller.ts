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
    description: 'Invalida o token de acesso atual do usuário',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessão encerrada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acesso não fornecido ou inválido',
  })
  @Auth(AuthType.Private)
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signOut(@ActiveUser() user: ActiveUserData, @Req() request: Request) {
    const userId = user.sub; // Use user.sub directly
    const accessToken = request.headers['authorization']; // Extract the access token from the request headers
    if (!accessToken) {
      throw new UnauthorizedException('Access token not provided');
    }
    await this.authService.signOut(userId, accessToken.split(' ')[1]); // Call the signOut method with userId and accessToken
    // updated to use userId from ActiveUserData
  }

  @ApiOperation({
    summary: 'Solicitar redefinição de senha',
    description: 'Envia um email com instruções para redefinição de senha',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email de redefinição enviado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Email não encontrado ou inválido',
  })
  @ApiBody({
    examples: {
      'application/json': {
        value: {
          email: 'user@example.com',
        },
      },
    },
    description: 'Request password reset',
  })
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() { email }: RequestPasswordResetDto) {
    const payload: RequestPasswordResetDto = { email };
    return await this.authService.requestPasswordReset(payload);
  }

  @ApiOperation({
    summary: 'Redefinir senha',
    description:
      'Redefine a senha do usuário usando o token recebido por email',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Senha redefinida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Token inválido ou expirado',
  })
  @ApiBody({
    description: 'Dados para redefinição de senha',
    examples: {
      'application/json': {
        value: {
          token: 'token-recebido-por-email'
        },
      },
    },
  })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

  @ApiOperation({
    summary: 'Cadastrar usuário',
    description: 'Cria uma nova conta de usuário no sistema',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuário criado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou email já cadastrado',
  })
  @ApiBody({
    examples: {
      'application/json': {
        value: {
          name: 'User Name',
          email: 'user@example.com', // added email field
          password: 'securepassword',
          role: 'USER', // added role field
        },
      },
    },
    description: 'Sign up user',
  })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED) // changed since the default is 201
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Autentica um usuário e retorna tokens de acesso',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Autenticação realizada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Credenciais inválidas',
  })
  @ApiBody({
    examples: {
      'application/json': {
        value: {
          email: 'user@example.com',
          password: 'securepassword',
        },
      },
    },
    description: 'Sign in user',
  })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signIn(
    @Res({
      passthrough: true,
    })
    response: Response,
    @Body() signInDto: SignInDto,
  ) {
    const accessToken = await this.authService.signIn(signInDto);
    response.cookie('accessToken', accessToken.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return accessToken;
  }

  @ApiOperation({
    summary: 'Renovar tokens',
    description: 'Gera um novo token de acesso usando o refresh token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tokens renovados com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token inválido ou expirado',
  })
  @ApiBody({
    examples: {
      'application/json': {
        value: {
          refreshToken: 'your-refresh-token', // added refreshToken field
        },
      },
    },
    description: 'Refresh tokens',
  })
  @ApiBearerAuth()
  @Auth(AuthType.Private)
  @HttpCode(HttpStatus.OK) // changed since the default is 201
  @Post('refresh-tokens')
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
  ) {
    const accessToken = request.headers['authorization']?.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('Access token not provided');
    }
    console.log(accessToken);
    return this.authService.refreshTokens(refreshTokenDto, accessToken);
  }
}
