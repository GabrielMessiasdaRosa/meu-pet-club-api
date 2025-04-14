import { RoleEnum } from '@/common/enums/role.enum';
import { User } from '@/domain/entities/user.entity';
import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HashingService } from '../hashing/hashing.service';
import { TokenIdsStorage } from '../redis/storage/token-ids.storage';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: MongooseUserRepository;
  let hashingService: HashingService;
  let jwtService: JwtService;
  let tokenIdsStorage: TokenIdsStorage;

  const mockUser = new User({
    id: 'mock-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
    role: RoleEnum.USER,
  });

  const mockUserRepository = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockHashingService = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockTokenIdsStorage = {
    insert: jest.fn(),
    validate: jest.fn(),
    invalidate: jest.fn(),
    addToBlacklist: jest.fn(),
  };

  const mockEmailService = {
    sendPasswordReset: jest.fn(),
  };

  const mockJwtConfig = {
    secret: 'test-secret',
    audience: 'test-audience',
    issuer: 'test-issuer',
    accessTokenTtl: 3600,
    refreshTokenTtl: 86400,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authService = new AuthService(
      mockUserRepository as any,
      mockHashingService as any,
      mockEmailService as any,
      mockJwtService as any,
      mockJwtConfig as any,
      mockTokenIdsStorage as any,
    );

    userRepository = mockUserRepository as any;
    hashingService = mockHashingService as any;
    jwtService = mockJwtService as any;
    tokenIdsStorage = mockTokenIdsStorage as any;
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const signUpDto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: RoleEnum.USER,
      };

      mockHashingService.hash.mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockResolvedValue(undefined);

      const result = await authService.signUp(signUpDto);

      expect(mockHashingService.hash).toHaveBeenCalledWith('password123');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User created successfully' });
    });

    it('should throw ConflictException when email already exists', async () => {
      const signUpDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
        role: RoleEnum.USER,
      };

      mockUserRepository.create.mockRejectedValue({ code: 11000 });

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ForbiddenException when non-ROOT user tries to create a ROOT user', async () => {
      const signUpDto = {
        email: 'root@example.com',
        password: 'password123',
        name: 'Root User',
        role: RoleEnum.ROOT,
      };

      await expect(authService.signUp(signUpDto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('signIn', () => {
    it('should return tokens when credentials are valid', async () => {
      const signInDto = { email: 'test@example.com', password: 'password123' };
      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockHashingService.compare.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await authService.signIn(signInDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        signInDto.email,
      );
      expect(mockHashingService.compare).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.Password,
      );
      expect(tokenIdsStorage.insert).toHaveBeenCalled();
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      const signInDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const signInDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockHashingService.compare.mockResolvedValue(false);

      await expect(authService.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('should return new tokens when refresh token is valid', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const decodedToken = {
        sub: 'mock-id',
        refreshTokenId: 'refresh-token-id',
      };

      mockJwtService.verifyAsync.mockResolvedValue(decodedToken);
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockTokenIdsStorage.validate.mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');

      const result = await authService.refreshTokens(
        refreshTokenDto,
        'old-access-token',
      );

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        expect.any(Object),
      );
      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        decodedToken.sub,
      );
      expect(mockTokenIdsStorage.validate).toHaveBeenCalledWith(
        mockUser.Id,
        decodedToken.refreshTokenId,
      );
      expect(mockTokenIdsStorage.addToBlacklist).toHaveBeenCalledWith(
        'old-access-token',
      );
      expect(mockTokenIdsStorage.invalidate).toHaveBeenCalledWith(mockUser.Id);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  /*   describe('requestPasswordReset', () => {
    it('should create reset token and send email', async () => {
      const requestDto = { email: 'test@example.com' };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(undefined);

      const result = await authService.requestPasswordReset(requestDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        requestDto.email,
      );
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Email de recuperação de senha enviado.',
      });
    });
  });

  describe('resetPassword', () => {
    it('should reset user password when token is valid', async () => {
      const resetDto = {
        email: 'test@example.com',
        newPassword: 'newPassword123',
        resetToken: 'valid-reset-token',
      };

      const userWithValidToken = new User({
        id: mockUser.Id,
        name: mockUser.Name,
        email: mockUser.Email,
        password: mockUser.Password,
        role: mockUser.Role,
        resetToken: 'valid-reset-token',
        resetTokenExpires: new Date(Date.now() + 1000 * 60 * 10), // 10 minutes in future
      });

      mockUserRepository.findByEmail.mockResolvedValue(userWithValidToken);
      mockHashingService.hash.mockResolvedValue('newHashedPassword');
      mockUserRepository.update.mockResolvedValue(undefined);

      const result = await authService.resetPassword(resetDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        resetDto.email,
      );
      expect(mockHashingService.hash).toHaveBeenCalledWith(
        resetDto.newPassword,
      );
      expect(mockUserRepository.update).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: 'A senha sua foi alterada.' });
    });
  });
 */
  describe('signOut', () => {
    it('should add token to blacklist and invalidate refresh tokens', async () => {
      await authService.signOut('user-id', 'access-token');

      expect(mockTokenIdsStorage.addToBlacklist).toHaveBeenCalledWith(
        'access-token',
      );
      expect(mockTokenIdsStorage.invalidate).toHaveBeenCalledWith('user-id');
    });
  });
});
