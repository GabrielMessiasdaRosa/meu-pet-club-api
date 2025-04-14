import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY } from '../../decorators/auth.decorator';
import { AuthType } from '../../enums/auth-type.enum';
import { AccessTokenGuard } from '../access-token/access-token.guard';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let accessTokenGuard: AccessTokenGuard;

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    accessTokenGuard = {
      canActivate: jest.fn(),
    } as unknown as AccessTokenGuard;

    guard = new AuthGuard(reflector, accessTokenGuard);

    jest.clearAllMocks();
  });

  it('deve permitir acesso a rotas públicas', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(AuthType.Public);

    const result = await guard.canActivate(mockExecutionContext);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(AUTH_TYPE_KEY, [
      mockExecutionContext.getHandler(),
      mockExecutionContext.getClass(),
    ]);
    expect(accessTokenGuard.canActivate).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('deve usar AccessTokenGuard para rotas privadas', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(AuthType.Private);
    accessTokenGuard.canActivate = jest.fn().mockResolvedValue(true);

    const result = await guard.canActivate(mockExecutionContext);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(AUTH_TYPE_KEY, [
      mockExecutionContext.getHandler(),
      mockExecutionContext.getClass(),
    ]);
    expect(accessTokenGuard.canActivate).toHaveBeenCalledWith(
      mockExecutionContext,
    );
    expect(result).toBe(true);
  });

  it('deve bloquear rotas privadas quando AccessTokenGuard falhar', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(AuthType.Private);
    accessTokenGuard.canActivate = jest
      .fn()
      .mockRejectedValue(new UnauthorizedException());

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(AUTH_TYPE_KEY, [
      mockExecutionContext.getHandler(),
      mockExecutionContext.getClass(),
    ]);
    expect(accessTokenGuard.canActivate).toHaveBeenCalledWith(
      mockExecutionContext,
    );
  });

  it('deve assumir rotas como privadas por padrão', async () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(undefined);
    accessTokenGuard.canActivate = jest.fn().mockResolvedValue(true);

    const result = await guard.canActivate(mockExecutionContext);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(AUTH_TYPE_KEY, [
      mockExecutionContext.getHandler(),
      mockExecutionContext.getClass(),
    ]);
    expect(accessTokenGuard.canActivate).toHaveBeenCalledWith(
      mockExecutionContext,
    );
    expect(result).toBe(true);
  });
});
