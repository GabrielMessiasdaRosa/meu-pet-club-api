import { RoleEnum } from '@/common/enums/role.enum';
import { User } from '@/domain/entities/user.entity';
import { HateoasResource } from '@/interface/server/presenters/hateoas-resource.presenter';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { REQUEST_USER_KEY } from '../constants/iam.constants';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    signUp: jest.fn(),
    signIn: jest.fn(),
    refreshTokens: jest.fn(),
    signOut: jest.fn(),
    requestPasswordReset: jest.fn(),
    resetPassword: jest.fn(),
  };

  // Mock completo do Response
  const mockResponse = {
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn(),
    json: jest.fn(),
    sendStatus: jest.fn(),
    links: jest.fn(),
    // Adicionando outras propriedades necessárias
    get: jest.fn(),
    set: jest.fn(),
    header: jest.fn(),
    clearCookie: jest.fn(),
    render: jest.fn(),
    format: jest.fn(),
    redirect: jest.fn(),
    type: jest.fn(),
  } as unknown as Response;

  // Mock completo do Request
  const createMockRequest = (headers = {}, body = {}) =>
    ({
      headers,
      body,
      params: {},
      query: {},
      get: jest.fn((name: string) => headers[name.toLowerCase()]),
      header: jest.fn((name: string) => headers[name.toLowerCase()]),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
    }) as unknown as Request;

  const mockRequest = createMockRequest({
    authorization: 'Bearer mock_token',
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signIn', () => {
    const signInDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should sign in user successfully and set cookie', async () => {
      const user = new User({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: RoleEnum.USER,
      });

      const authResult = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: user,
      };

      mockAuthService.signIn.mockResolvedValueOnce(authResult);

      const result = await controller.signIn(mockResponse, signInDto);

      expect(mockAuthService.signIn).toHaveBeenCalledWith(signInDto);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access_token',
        {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
        },
      );
      expect(result).toBeInstanceOf(HateoasResource);
      expect(result.data).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        user: {
          id: user.Id,
          email: user.Email,
          name: user.Name,
          role: user.Role,
        },
      });
      expect(result.links).toHaveLength(3); // Verifica se os links foram adicionados
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      const user: ActiveUserData = {
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: RoleEnum.USER,
      };

      mockAuthService.signOut.mockResolvedValueOnce(undefined);

      const result = await controller.signOut(user, mockRequest);

      expect(mockAuthService.signOut).toHaveBeenCalledWith(
        'user-id',
        'mock_token',
      );
      expect(result).toBeInstanceOf(HateoasResource);
      expect(result.data).toEqual({
        message: 'Sessão encerrada com sucesso',
      });
      expect(result.links).toBeDefined();
    });

    it('should throw UnauthorizedException if no access token provided', async () => {
      const user: ActiveUserData = {
        sub: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: RoleEnum.USER,
      };

      const requestWithoutToken = createMockRequest({});

      await expect(
        controller.signOut(user, requestWithoutToken),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signUp', () => {
    const signUpDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: RoleEnum.USER,
    };

    it('should sign up user successfully with no authenticated user', async () => {
      mockAuthService.signUp.mockResolvedValueOnce({
        message: 'User created successfully',
      });

      const requestWithoutUser = createMockRequest();

      const result = await controller.signUp(signUpDto, requestWithoutUser);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(signUpDto, undefined);
      expect(result).toBeInstanceOf(HateoasResource);
      expect(result.data).toEqual({
        message: 'User created successfully',
      });
      expect(result.links).toBeDefined();
    });

    it('should sign up user successfully with authenticated user', async () => {
      mockAuthService.signUp.mockResolvedValueOnce({
        message: 'User created successfully',
      });

      const authenticatedUser: ActiveUserData = {
        sub: 'admin-id',
        email: 'admin@example.com',
        name: 'Admin User',
        role: RoleEnum.ADMIN,
      };

      const requestWithUser = createMockRequest();
      // Ajuste para adicionar o usuário autenticado corretamente
      requestWithUser[REQUEST_USER_KEY] = authenticatedUser;

      const result = await controller.signUp(signUpDto, requestWithUser);

      expect(mockAuthService.signUp).toHaveBeenCalledWith(
        signUpDto,
        authenticatedUser,
      );
      expect(result).toBeInstanceOf(HateoasResource);
      expect(result.data).toEqual({
        message: 'User created successfully',
      });
      expect(result.links).toBeDefined();
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      const email = 'test@example.com';
      mockAuthService.requestPasswordReset.mockResolvedValueOnce({
        message: 'Email de recuperação de senha enviado.',
      });

      const result = await controller.requestPasswordReset({ email });

      expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith({
        email,
      });
      expect(result).toBeInstanceOf(HateoasResource);
      expect(result.data).toEqual({
        message: 'Email de recuperação de senha enviado.',
      });
      expect(result.links).toBeDefined();
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto = {
      email: 'test@example.com',
      newPassword: 'new_password123',
      resetToken: 'valid-reset-token',
    };

    it('should reset password successfully', async () => {
      mockAuthService.resetPassword.mockResolvedValueOnce({
        message: 'A senha sua foi alterada.',
      });

      const result = await controller.resetPassword(resetPasswordDto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto,
      );
      expect(result).toBeInstanceOf(HateoasResource);
      expect(result.data).toEqual({
        message: 'A senha sua foi alterada.',
      });
      expect(result.links).toBeDefined();
    });
  });

  describe('refreshTokens', () => {
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should refresh tokens successfully', async () => {
      const user = new User({
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: RoleEnum.USER,
      });

      const authResult = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        user: user,
      };

      mockAuthService.refreshTokens.mockResolvedValueOnce(authResult);

      const result = await controller.refreshTokens(
        refreshTokenDto,
        mockRequest,
      );

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        refreshTokenDto,
        'mock_token',
      );
      expect(result).toBeInstanceOf(HateoasResource);
      expect(result.data).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
        user: {
          id: user.Id,
          email: user.Email,
          name: user.Name,
          role: user.Role,
        },
      });
      expect(result.links).toBeDefined();
    });

    it('should throw UnauthorizedException if no access token provided', async () => {
      const requestWithoutToken = createMockRequest({});

      await expect(
        controller.refreshTokens(refreshTokenDto, requestWithoutToken),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
