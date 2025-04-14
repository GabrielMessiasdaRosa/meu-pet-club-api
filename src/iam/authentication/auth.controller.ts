import {
  ApiRefreshTokens,
  ApiRequestPasswordReset,
  ApiResetPassword,
  ApiSignIn,
  ApiSignOut,
  ApiSignUp,
} from '@/common/decorators/swagger';
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
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { REQUEST_USER_KEY } from '../constants/iam.constants';
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

  @ApiSignOut()
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

  @ApiRequestPasswordReset()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() { email }: RequestPasswordResetDto,
  ): Promise<HateoasResource<AuthMessageResponse>> {
    const payload: RequestPasswordResetDto = { email };
    const result = await this.authService.requestPasswordReset(payload);
    return AuthPresenter.toHateoasPasswordResetRequest(result.message);
  }

  @ApiResetPassword()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<HateoasResource<AuthMessageResponse>> {
    const result = await this.authService.resetPassword(resetPasswordDto);
    return AuthPresenter.toHateoasPasswordReset(result.message);
  }

  @ApiSignUp()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body() signUpDto: SignUpDto,
    @Req() request: Request,
  ): Promise<HateoasResource<AuthMessageResponse>> {
    // Verifica se há um usuário autenticado na requisição
    // Isso permite que usuários autenticados possam criar outros usuários
    const authenticatedUser = request[REQUEST_USER_KEY] as ActiveUserData;

    const result = await this.authService.signUp(signUpDto, authenticatedUser);
    return AuthPresenter.toHateoasSignUp(result.message);
  }

  @ApiSignIn()
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

  @ApiRefreshTokens()
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
