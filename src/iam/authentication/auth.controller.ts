import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthType } from './enums/auth-type.enum';

@ApiTags('auth')
@Auth(AuthType.Private)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signOut(@Body('userId') userId: string) {
    return await this.authService.signOut(userId);
  }

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

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }

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
  @HttpCode(HttpStatus.OK) // changed since the default is 201
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
