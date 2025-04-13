import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { RoleEnum } from '@/common/enums/role.enum';
import { User } from '@/domain/entities/user.entity';
import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import jwtConfig from '../config/jwt.config';
import { HashingService } from '../hashing/hashing.service';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { sendMail } from '../libs/request-new-password';
import {
  InvalidatedRefreshTokenError,
  TokenIdsStorage,
} from '../redis/storage/token-ids.storage';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestPasswordResetDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('UserRepository')
    @Inject('UserRepository')
    private userRepository: MongooseUserRepository,
    private readonly hashingService: HashingService,

    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly tokenIdsStorage: TokenIdsStorage,
  ) {}
  async requestPasswordReset({ email }: RequestPasswordResetDto) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const fiveMinutes = 1000 * 60 * 5;
    const resetToken = randomUUID();
    await this.userRepository.update(user.Id, {
      ResetToken: resetToken,
      ResetTokenExpires: new Date(Date.now() + fiveMinutes),
    });
    // Send password reset email with resetToken
    await sendMail(email, resetToken);
    return {
      message: 'Email de recuperação de senha enviado.',
    };
  }

  async resetPassword({ email, newPassword, resetToken }: ResetPasswordDto) {
    /*   const user = await this.userRepository.findOne({
      where: { email: email, resetToken: resetToken },
    }); */
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Algo deu errado, tente novamente.');
    }

    await this.checkResetToken(user);

    user.setPassword(await this.hashingService.hash(newPassword));
    await this.userRepository.update(user.Id, {
      Password: user.Password,
    });
    await this.resetUserPasswordTokens(user);
    return {
      message: 'A senha sua foi alterada.',
    };
  }

  private async checkResetToken(user: User): Promise<boolean | void> {
    if (!!user.ResetTokenExpires && user.ResetTokenExpires < new Date()) {
      await this.resetUserPasswordTokens(user);
      throw new UnauthorizedException(
        'A solicitação expirou, tente novamente.',
      );
    }
    if (!user.ResetToken) {
      await this.resetUserPasswordTokens(user);
      throw new UnauthorizedException(
        'A solicitação expirou, tente novamente.',
      );
    }
    return true;
  }

  async resetUserPasswordTokens(user: User) {
    user.setResetToken(null);
    user.setResetTokenExpires(null);
    await this.userRepository.update(user.Id, {});
  }

  async signOut(userId: string, accessToken: string) {
    await this.tokenIdsStorage.addToBlacklist(accessToken);
    await this.tokenIdsStorage.invalidate(userId);
  }

  async signUp(signUpDto: SignUpDto, currentUser?: ActiveUserData) {
    try {
      // Verificando se está tentando criar um usuário ROOT
      if (signUpDto.role === RoleEnum.ROOT) {
        // Se for um registro público ou o usuário atual não for ROOT, não permite
        if (!currentUser || currentUser.role !== RoleEnum.ROOT) {
          throw new ForbiddenException(
            'Apenas usuários ROOT podem criar outros usuários ROOT',
          );
        }
      }

      // Verificando se um ADMIN está tentando criar um usuário USER
      if (
        currentUser &&
        currentUser.role === RoleEnum.ADMIN &&
        signUpDto.role === RoleEnum.USER
      ) {
        throw new ForbiddenException(
          'Usuários ADMIN não podem criar usuários do tipo USER',
        );
      }

      const user = new User({
        id: randomUUID(),
        email: signUpDto.email,
        password: signUpDto.password,
        name: signUpDto.name,
        role: signUpDto.role,
      });
      user.setPassword(await this.hashingService.hash(user.Password));

      await this.userRepository.create(user);
      return {
        message: 'User created successfully',
      };
    } catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      if (err.code === 11000) {
        // MongoDB duplicate key error
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findByEmail(signInDto.email);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await this.hashingService.compare(
      signInDto.password,
      user.Password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return await this.generateTokens(user);
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto, accessToken: string) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });
      const user = await this.userRepository.findById(sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const isValid = await this.tokenIdsStorage.validate(
        user.Id,
        refreshTokenId,
      );
      if (!isValid) {
        throw new UnauthorizedException();
      } else {
        await this.tokenIdsStorage.addToBlacklist(accessToken);
        await this.tokenIdsStorage.invalidate(user.Id);
      }
      return this.generateTokens(user);
    } catch (err) {
      if (err instanceof InvalidatedRefreshTokenError) {
        throw new UnauthorizedException('Access Denied');
      }
      throw new UnauthorizedException();
    }
  }

  private async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.Id,
        this.jwtConfiguration.accessTokenTtl,
        {
          // @audit-ok Sempre que for atualizar o token, atualizar aqui também
          email: user.Email,
          name: user.Name,
          role: user.Role,
        },
      ),
      this.signToken(user.Id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);
    await this.tokenIdsStorage.insert(user.Id, refreshTokenId);
    return {
      accessToken,
      refreshToken,
      user,
    };
  }
  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.accessTokenTtl,
      },
    );
  }
}
