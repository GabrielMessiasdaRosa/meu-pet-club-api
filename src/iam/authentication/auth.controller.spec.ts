import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signUp', () => {
    it('should call authService.signUp with the provided signUpDto', async () => {
      const signUpDto: SignUpDto = {
        email: 'john@email.com',
        password: 'password',
        username: 'john',
      };

      const signUpSpy = jest.spyOn(authService, 'signUp');
      await controller.signUp(signUpDto);

      expect(signUpSpy).toHaveBeenCalledWith(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with the provided signInDto', async () => {
      const signInDto: SignInDto = {
        email: 'john@email.com',
        password: 'password',
      };
      const response: Response = {} as Response;

      const signInSpy = jest.spyOn(authService, 'signIn');
      await controller.signIn(response, signInDto);

      expect(signInSpy).toHaveBeenCalledWith(response, signInDto);
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens with the provided refreshTokenDto', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refreshToken',
      };

      const refreshTokensSpy = jest.spyOn(authService, 'refreshTokens');
      await controller.refreshTokens(refreshTokenDto);

      expect(refreshTokensSpy).toHaveBeenCalledWith(refreshTokenDto);
    });
  });
});
