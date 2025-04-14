import { RoleEnum } from '@/common/enums/role.enum';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../../../config/jwt.config';
import { REQUEST_USER_KEY } from '../../../constants/iam.constants';
import { TokenIdsStorage } from '../../../redis/storage/token-ids.storage';
import { AccessTokenGuard } from './access-token.guard';

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;
  let jwtService: JwtService;
  let tokenIdsStorage: TokenIdsStorage;

  const mockToken = 'valid.jwt.token';
  const mockUser = {
    sub: 'user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: RoleEnum.USER,
  };

  const mockRequest = {
    headers: {
      authorization: `Bearer ${mockToken}`,
    },
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest),
    }),
  } as unknown as ExecutionContext;

  const mockJwtConfiguration = {
    secret: 'test-secret',
    audience: 'test-audience',
    issuer: 'test-issuer',
    accessTokenTtl: 3600,
    refreshTokenTtl: 86400,
  };

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as JwtService;

    tokenIdsStorage = {
      isBlacklisted: jest.fn(),
    } as unknown as TokenIdsStorage;

    guard = new AccessTokenGuard(
      jwtService,
      { KEY: jwtConfig.KEY } as any,
      mockJwtConfiguration as ConfigType<typeof jwtConfig>,
      tokenIdsStorage,
    );

    jest.clearAllMocks();
  });

  it('deve permitir acesso quando o token é válido e não está na blacklist', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockUser);
    (tokenIdsStorage.isBlacklisted as jest.Mock).mockResolvedValue(false);

    const result = await guard.canActivate(mockExecutionContext);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(mockToken, {
      secret: mockJwtConfiguration.secret,
      audience: mockJwtConfiguration.audience,
      issuer: mockJwtConfiguration.issuer,
    });

    expect(tokenIdsStorage.isBlacklisted).toHaveBeenCalledWith(mockToken);
    expect(mockRequest[REQUEST_USER_KEY]).toEqual(mockUser);
    expect(result).toBe(true);
  });

  it('deve bloquear acesso quando o token está na blacklist', async () => {
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(mockUser);
    (tokenIdsStorage.isBlacklisted as jest.Mock).mockResolvedValue(true);

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(jwtService.verifyAsync).toHaveBeenCalled();
    expect(tokenIdsStorage.isBlacklisted).toHaveBeenCalledWith(mockToken);
  });

  it('deve bloquear acesso quando o token não é fornecido', async () => {
    const requestWithoutToken = {
      headers: {},
    };

    const contextWithoutToken = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(requestWithoutToken),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(contextWithoutToken)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    expect(tokenIdsStorage.isBlacklisted).not.toHaveBeenCalled();
  });

  it('deve bloquear acesso quando o token é inválido', async () => {
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('Invalid token'),
    );

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(jwtService.verifyAsync).toHaveBeenCalled();
    expect(tokenIdsStorage.isBlacklisted).not.toHaveBeenCalled();
  });
});
