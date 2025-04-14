import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AUTH_TYPE_KEY } from '../../decorators/auth.decorator';
import { AuthType } from '../../enums/auth-type.enum';
import { AccessTokenGuard } from '../access-token/access-token.guard';

@Injectable()
export class AuthGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.Private;

  private readonly authTypeGuardMap: Record<
    AuthType,
    CanActivate | CanActivate[]
  >;
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Private]: this.accessTokenGuard,
      [AuthType.Public]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthGuard.defaultAuthType];
    const guards = authTypes
      .map((authType) => this.authTypeGuardMap[authType])
      .flat();
    let error = new UnauthorizedException();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((e) => {
        error = e;
      });

      if (canActivate) {
        return true;
      }
    }

    throw error;
  }
}
