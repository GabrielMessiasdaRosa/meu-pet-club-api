import { MongooseUserRepository } from '@/infra/database/mongodb/repositories/user.repository';
import { UserSchemaDocument } from '@/infra/database/mongodb/schemas/user.schema';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './authentication/auth.controller';
import { AuthService } from './authentication/auth.service';
import { AccessTokenGuard } from './authentication/guards/access-token/access-token.guard';
import { AuthGuard } from './authentication/guards/auth/auth.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage/refresh-token-ids.storage';
import jwtConfig from './config/jwt.config';
import { BcryptService } from './hashing/bcrypt.service';
import { HashingService } from './hashing/hashing.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchemaDocument }]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: 'UserRepositoryModel',
      useClass: MongooseUserRepository,
    },
    AccessTokenGuard,
    RefreshTokenIdsStorage,
    AuthService,
  ],
  controllers: [AuthController],
})
export class IamModule {}
